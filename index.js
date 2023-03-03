let allDoodlebots = {}; // id -> doodlebot object for control the REAl doodlebots. id is the bluetooth device id
let allWorkers = {}; //doodlebot id -> worker object
let currentVectors = {}; //id -> {rvec: , tvec: }. id is the aruco id 

let cameraController;
let videoObj = document.getElementById("videoId");
let width = videoObj.width;
let height = videoObj.height;
let context = arucoCanvasOutput.getContext("2d", { willReadFrequently: true });
let DOODLEBOT_ID = 1;
let homographicMatrix; // to transform camera stream into a "flat" 2D frame

let canvasProjectionOut; //Opencv matrix to store projection of 2d - needs to be global variable because otherwise opencv complains after a few seconds
let scalarProjection; //unclear if needed

let BORDER_IDS = {
  BOTTOM_LEFT: 31,  //bottom left
  BOTTOM_RIGHT: 32, // bottom righ
  TOP_RIGHT: 33, //top right
  TOP_LEFT: 34 //top left
}
IGNORE_IDS = []; // ids for which we wont keep track of the aruco data (rvec, tvec)

// Number of frames to check to figure out whether a marker is still on the board
let numFrames = 20; 
//RECORDING Reading from the video stream and checking which aruco ids are being picked up
//SETUP if still making sure the bot, obstacles, coins are detected correctly (also in rotation)
//LOCKED if the original virtual position and rotations are locked
let STATES = {
  RECORDING: "RECORDING",
  SETUP: "SETUP",
  LOCKED: "LOCKED"
}
let positionState = STATES.RECORDING;
let foundArucoIds = new Set(); //ids of objects found in the RECORDING state

//id -> {type, width: , height: }
const OBJECT_SIZES = {
  //bots
  1: {type: BOT_TYPE, width: 5, height: 5, relative_anchor: [2, 2]},
  2: {type: BOT_TYPE, width: 5, height: 5, relative_anchor: [2, 2]},
  3: {type: BOT_TYPE, width: 5, height: 5, relative_anchor: [2, 2]},
  4: {type: BOT_TYPE, width: 5, height: 5, relative_anchor: [2, 2]},
  5: {type: BOT_TYPE, width: 5, height: 5, relative_anchor: [2, 2]},
  // obstacles
  11: {type: OBSTACLE_TYPE, width: 1, height: 1},
  12: {type: OBSTACLE_TYPE, width: 1, height: 1},
  13: {type: OBSTACLE_TYPE, width: 1, height: 1},
  14: {type: OBSTACLE_TYPE, width: 1, height: 1},
  15: {type: OBSTACLE_TYPE, width: 1, height: 1},
  // coins
  21: {type: COIN_TYPE, width: 1, height: 1},
  22: {type: COIN_TYPE, width: 1, height: 1},
  23: {type: COIN_TYPE, width: 1, height: 1},
  24: {type: COIN_TYPE, width: 1, height: 1},
  25: {type: COIN_TYPE, width: 1, height: 1}

}
let MARKERS_INFO = {};
for (let marker_id in OBJECT_SIZES){
  MARKERS_INFO[marker_id] = {};
}
/**
 * Camera controllers
 */
if (typeof cv !== "undefined") {
  onReady();
} else {
  document.getElementById("opencvjs").addEventListener("load", onReady);
}

async function onReady() {
  console.log("Opencv is ready!");
  cv = await cv;
  document.getElementById("activateCameraButton").disabled = false;
  document.getElementById("deactivateCameraButton").disabled = false;

  canvasProjectionOut = new cv.Mat();
  scalarProjection = new cv.Scalar();

  cameraController = new CameraController(
    cameraMatrix,
    distCoeffs,
    height,
    width,
    cameraConstraints
  );
  for (key in BORDER_IDS) {
    let el = document.createElement("option");
    el.setAttribute("value", BORDER_IDS[key]);
    el.innerHTML = `${key} - ${BORDER_IDS[key]}`;
    selectCorners.appendChild(el);
  }
}
deactivateCameraButton.addEventListener("click", (evt) => {
  cameraController.deactivateCamera();
});

activateCameraButton.addEventListener("click", async (evt) => {
  let stream = await cameraController.activateCamera();
  videoObj.srcObject = stream;
  //create grid
  processVideo();
  grid = new VirtualGrid(rows, cols, {
      onAddBot,
      onAddObstacle: onAddObject,
      onAddCoin: onAddObject
  });
  drawBoard();
});
changeStateButton.addEventListener("click", (evt)=>{
  if (positionState === STATES.RECORDING){
    //Adding all objects seen so far to the grid, to allow 
    positionState = STATES.SETUP;
    stateTextSpan.innerHTML = "Currently fixing any problem from the video stream"
  } else if (positionState === STATES.SETUP){
    positionState = STATES.LOCKED;
    stateTextSpan.innerHTML = "Positions and sizes of objects are locked"
  } else if (positionState === STATES.LOCKED){
    positionState = STATES.RECORDING;
    stateTextSpan.innerHTML = "Currently reading the video stream"
  } else {
    console.log(`positionState ${positionState} is not a valid state`);
  }
})
startBotsButton.addEventListener("click", (evt)=>{
  let wasMoving;
  for (let bot_id in grid.bots){
    let bot_index = 0;
    wasMoving = grid.bots[bot_id][bot_index].isMoving;
    grid.change_moving_status(bot_id);
  }
  startBotsButton.innerText = wasMoving ? "Start bots": "Stop bots"
})
updateBoard.addEventListener("click", findHomographicMatrix);
let markerSize = 0.1;

/**
 *
 * @param {*} rvec 
 * @returns  The 2d angle direction of the rotation vector
 */
function getRotation2DAngle(rvec) {
  let rot = new cv.Mat();
  cv.Rodrigues(rvec, rot);
  //TODO: Figure out if you only need to do the 2d projection of the direction 
  let dir = rot.row(1).data64F; // * halfSide;
  let dir2D = get2D(dir);
  let angle = Math.atan2(dir2D[1], dir2D[0]);
  angle = angle * 180 / Math.PI;
  if (angle < 0) { angle += 360; } //Make sure angle is on [0. 360)
  return angle;
}
function getCameraCoordinates(rvec, tvec) {
  let rot = new cv.Mat();
  cv.Rodrigues(rvec, rot);
  let inv = new cv.Mat();
  cv.transpose(rot, inv);
  console.log('inv');
  console.log(inv);
  let coords = new cv.Mat();
  let useless = new cv.Mat(); //to be multiplied by 0
  cv.gemm(inv, tvec, -1, useless, 0, coords);//-rot^t * tvec 
  return coords;
}
/**
 * 
 * @param {*} point 3d point, usually from a tvec.data64F
 * @returns 
 */
function get2D(point) {
  let rvec = cv.matFromArray(3, 1, cv.CV_64F, [0, 0, 0]);
  let tvec = cv.matFromArray(3, 1, cv.CV_64F, [0, 0, 0]);
  let out = new cv.Mat();
  let pt = cv.matFromArray(3, 1, cv.CV_64F, point);
  cv.projectPoints(pt, rvec, tvec, cameraMatrix, distCoeffs, out);
  let res = out.data64F;
  return res;
}
function findHomographicMatrix() {
  console.log("Finding homographic matrix")
  let worldx = 640;//3;
  let worldy = 640; //2;
  if (
    !currentVectors[BORDER_IDS.BOTTOM_LEFT] ||
    !currentVectors[BORDER_IDS.BOTTOM_RIGHT] ||
    !currentVectors[BORDER_IDS.TOP_RIGHT] ||
    !currentVectors[BORDER_IDS.TOP_LEFT]
  ) {
    console.log("Not 4 corners have been found yet");
    return;
  }
  //TODO: Figure out why bottom left and top left, and bottom right and top right are flipped!
  let bl = get2D(currentVectors[BORDER_IDS.BOTTOM_LEFT].tvec.data64F);
  let br = get2D(currentVectors[BORDER_IDS.BOTTOM_RIGHT].tvec.data64F);

  let tl = get2D(currentVectors[BORDER_IDS.TOP_LEFT].tvec.data64F);
  let tr = get2D(currentVectors[BORDER_IDS.TOP_RIGHT].tvec.data64F);

  console.log(`Bottom left = ${bl}`);
  console.log(`Bottom right = ${br}`);
  console.log(`Top left: ${tl}`);
  console.log(`Top right: ${tr}`);

  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [bl[0], bl[1], br[0], br[1], tl[0], tl[1], tr[0], tr[1]]);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, worldx, 0, 0, worldy, worldx, worldy]);
  homographicMatrix = cv.getPerspectiveTransform(srcTri, dstTri) //, dstTri); //cv.findHomography(srcTri, dstTri);
}
/**
 * 
 * @param {*} id aruco marker
 * @returns 2d position in the 2D grid of a given marker
 */
function getGridPosition(id){
  let [x, y] = getReal2dPosition(id);
  let [gridX, gridY] = [Math.floor(x / width * cols), Math.floor(y / width * rows)];
  return [gridX, gridY];  
}
/**
 * 
 * @param {*} realAngle 
 * @returns get angle from 0, 90, 180, 270 that is closest to realAngle
 * Might be broken, since angles calculated from camera are funky
 */
function getClosestAngle(realAngle){
  let possibilities = Object.values(ANGLE_DIRS).sort((a, b) => Math.abs(a-realAngle) - Math.abs(b-realAngle));
  return possibilities[0]; //the closes to realAngle
}
/**
 * 
 * @param {*} id aruco marker
 * @returns BOT_TYPE, OBSTACLE_TYPE or COIN_TYPE, accordingly
 */
function getTypeObject(id){
  if (!(id in OBJECT_SIZES)){
    return null; //not object we care about
  }
  return OBJECT_SIZES[id].type;
}
/**
 * Updates position of a given bot in the virtual grid. If the bot is not there then it
 * will create one
 * @param {*} id aruco marker
 */
function updateVirtualBot(id){
    let [gridX, gridY] = getGridPosition(id);
    let realAngle = getRotation2DAngle(currentVectors[id].rvec);
    let gridAngle = getClosestAngle(realAngle);
    //If its not there, create one
    if (!grid.bots[id]){
      if (!(id in OBJECT_SIZES)){
        console.log(`Couldnt find size information for id = ${id} `)
      }
      let {relative_anchor, width, height} = OBJECT_SIZES[id];
      let [anchor_x, anchor_y] = relative_anchor;
      //virtual bot doesnt exist, so create one
      grid.add_bot({
        id: id,
        real_bottom_left: [gridX-anchor_x, gridY-anchor_y],
        relative_anchor: [anchor_x, anchor_y],
        width: width,
        height: height,
        angle: gridAngle
      })
    } else{
      //If it already exists, just update position and angle. Only update in the first state
      if (positionState === STATES.RECORDING){
        grid.update_bot(id, {new_angle: gridAngle, new_anchor: [gridX, gridY]})
      }
    }
}
/**
 * Updates position of a given obstacle in the virtual grid. If the obstacle is not there then it
 * will create one
 * @param {*} id aruco marker
 */
function updateVirtualObstacle(id){
    let [gridX, gridY] = getGridPosition(id);
    if (!grid.obstacles[id]){
      if (!(id in OBJECT_SIZES)){
        console.log(`Couldnt find size information for id =${id} `)
      }
      let {width, height} = OBJECT_SIZES[id];
      grid.add_obstacle({
        id: id,
        real_bottom_left:[gridX, gridY],
        relative_anchor: [0,0], //All obstacles will be created this way
        width: width,
        height: height,
      })
    } else {
      if (positionState === STATES.RECORDING){
        grid.update_obstacle(id, {new_anchor: [gridX, gridY]})
      }
    }
}
/**
 * Updates position of a given coin in the virtual grid. If the coin is not there then it
 * will create one
 * @param {*} id aruco marker
 */
function updateVirtualCoin(id){
  let [gridX, gridY] = getGridPosition(id);
  if (!grid.coins[id]){
    if (!(id in OBJECT_SIZES)){
      console.log(`Couldnt find size information for id =${id} `)
    }
    let {width, height} = OBJECT_SIZES[id];
    grid.add_coin({
      id: id,
      real_bottom_left:[gridX, gridY],
      relative_anchor: [0,0], //All obstacles will be created this way
      width: width,
      height: height,
    })
  } else {
    grid.update_coin(id, {new_anchor: [gridX, gridY]})
  }
}
/**
 * Updates virtual positions of all aruco markers found in currentVectors
 */
function updateVirtualObjects(){
  if (positionState !== STATES.RECORDING){
    return;
  }
  if (!homographicMatrix){
    return;
  }
  if (!grid){
    return;
  }
  for (let id in currentVectors){
    let typeObj = getTypeObject(id);
    if (!typeObj){
      continue;
    }
    id = Number(id); //otherwise itll be a string
    if (typeObj === BOT_TYPE){
      updateVirtualBot(id);
    } else if (typeObj === OBSTACLE_TYPE){
      updateVirtualObstacle(id);
    } else if (typeObj === COIN_TYPE){
      updateVirtualCoin(id);
    }
  }
}
/**
 * Draws horizontal and vertical lines in the canvas (just for visualization)
 */
function drawGrid(){
    let color = [0, 0, 255, 255];
    let thickness = 1;
    let p1;
    let p2;

    //Draw vertical lines
    for (let i = 0; i <= cols; i+=1){
      let x_1 = Math.floor((width-1) / cols * i)
      let y_1 = 0;
      let x_2 = Math.floor((width-1) / cols * i)
      let y_2 = height-1;
      p1 = new cv.Point(x_1, y_1);
      p2 = new cv.Point(x_2, y_2);
      
      cv.line(canvasProjectionOut, p1, p2, color, thickness);
    }

    //For horizontal lines
    for (let i = 0; i <= rows; i+=1){
      let x_1 = 0;
      let y_1 = Math.floor((height-1) / rows * i);
      let x_2 = width - 1;
      let y_2 = Math.floor((height-1) / rows * i);
      p1 = new cv.Point(x_1, y_1);
      p2 = new cv.Point(x_2, y_2);
      
      cv.line(canvasProjectionOut, p1, p2, color, thickness);
    }
    //TODO: Figure out why is this necessary, maybe because the camera coefficients
    //TODO 2: Maybe create a copy before moving
    cv.flip(canvasProjectionOut, canvasProjectionOut, 0)
}
/**
 * Projects the frame into a "flat" 2d version, adds grid lines and shows it in the canvas
 */
function show2dProjection() {
  if (!homographicMatrix) {
    log("Cannot do until homographicMatrix is defined");
    return;
  }
  if (!cameraController.src || !cameraController.src.data) {
    log('Src canvas not ready..')
    return;
  }
  try {
    let dsize = new cv.Size(width, height); //new cv.Size(cameraController.src.cols, cameraController.src.rows);
    cv.warpPerspective(cameraController.src, canvasProjectionOut, homographicMatrix, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, scalarProjection);
    drawGrid();
    cv.imshow("arucoCanvasOutputGrid", canvasProjectionOut); // canvasOutput is the id of another <canvas>;
    // dsize.release();
    return;
  } catch (e) {
    log("[show2dProjection] Uh oh..there was an error:");
    log(e);
    return
  }
}

/**
 * 
 * @param {*} tvecSource 
 * @param {*} tvecTarget 
 * @returns Gets difference of angles between two translation vector. Each angle is calculated with respect to the x axis. Returns an difference
 * on the interval [0, 360)
 */
function getTranslationAngleDiff(tvecSource, tvecTarget) {
  let src = tvecSource.data64F;
  let target = tvecTarget.data64F;
  src = get2D(src);
  target = get2D(target);
  let dx = target[0] - src[0];
  let dy = target[1] - src[1];
  let angle = Math.atan2(dy, dx);
  angle = angle * 180 / Math.PI;
  if (angle < 0) { angle += 360; } //Make sure angle is [0, 360), not -180, 180
  return angle;
}
/**
 * 
 * @param {*} sourceId aruco marker
 * @param {*} targetId aruco marker
 * @returns angle between two markers by taking into consideration both translation and rotation vectors. The response is on the range [-180, 180)
 * Still unclear if the calculations are correct. Might not be needed if we only care about grid movements, tho could help to check that the bot
 * is where it's supposed to be
 */
function getAngleBetweenMarkers(sourceId, targetId) {
  if (!currentVectors[sourceId] || !currentVectors[targetId]) {
    // console.log(`Both source (id = ${sourceId}) and target (id = ${targetId}) should be present in currentVectors!`);
    // console.log(currentVectors);
    return;
  }
  let infoSource = currentVectors[sourceId];
  let infoTarget = currentVectors[targetId];
  let rvecSource = infoSource.rvec;
  let tvecSource = infoSource.tvec;
  let rvecTarget = infoTarget.rvec;
  let tvecTarget = infoTarget.tvec;

  let sourceRotationAngle = getRotation2DAngle(rvecSource);
  let targetRotationAngle = getRotation2DAngle(rvecTarget);
  // let sourceTranslationAngle = getTranslation2DAngle(tvecSource);
  // let targetTranslationAngle = getTranslation2DAngle(tvecTarget);
  // let a = Math.atan2(get2D(tvecTarget.data64F)[1], get2D(tvecTarget.data64F)[0]) * 180 / Math.PI;
  let translationAngleDiff = getTranslationAngleDiff(tvecSource, tvecTarget);

  let res = sourceRotationAngle - translationAngleDiff;
  // Make sure res is [0, 360)
  if (res < 0) { res += 360; }
  //Only returning the smallest angle between res, 360-res
  if (res > 180) {
    return res - 360;
  } else {
    return res;
  }
  // let realCoordsSource = getCameraCoordinates(rvecSource, tvecSource).data64F;
  // let realCoordsTarget = getCameraCoordinates(rvecTarget, tvecTarget).data64F;  
  // let realCoordsTarget = tvecTarget.data64F;
  // let dx = rvecTarget.data64F[0] - rvecSource.data64F[0];
  // let dy = rvecTarget.data64F[1] - rvecSource.data64F[1];

  let dx = realCoordsTarget[0] - realCoordsSource[0];
  let dy = realCoordsTarget[1] - realCoordsSource[1];

  // let angle = Math.atan2(dy, dx);
  let angle = Math.atan(dy / dx);
  angle = angle * 180 / Math.PI; //should be close to 90
  return angle;
}
/**
 * Updates UI to show whats the angle between DOODLEBOT_ID and the given id
 * @param {*} id aruco marker
 * @param {*} imageData 
 */
function updateDistanceInfo(id) {
  let angle = getAngleBetweenMarkers(DOODLEBOT_ID, id);
  let distanceId = `distance-${id}`;
  let div = document.getElementById(distanceId);
  if (!div) {
    let newEl = document.createElement('div');
    newEl.setAttribute('id', `summary-${id}`);
    let text = document.createElement('span');
    text.innerHTML = `Angle to id ${id}: `;
    let distanceEl = document.createElement('span');
    distanceEl.setAttribute('id', distanceId)
    distanceEl.innerText = angle;

    newEl.appendChild(text);
    newEl.appendChild(distanceEl);
    summary.appendChild(newEl);
  } else {
    div.innerText = angle;
  }
}
/**
 * @returns true iff all the corners defined in BORDER_IDS have been detected by Aruco
 */
function allCornersFound() {
  for (let key in BORDER_IDS) {
    if (!currentVectors[BORDER_IDS[key]]) {
      return false;
    }
  }
  return true;
}
/**
 * update marker_id's "appear" array of 1s and 0s. It makes sure the length is up to numFrames 
 * @param {*} marker_id aruco marker
 * @param {*} appeared 1 if marker was detected, 0 otherwise
 */
function updateMarkerAppear(marker_id, appeared){
  let appear = MARKERS_INFO[marker_id].appear;
  if (!appear){appear = []};
  appear.push(appeared);
  if (appear.length > numFrames){
    //Need to delete oldest entry
    appear = appear.slice(1, appear.length);
  }
  MARKERS_INFO[marker_id].appear = appear;
}
const APPEAR_THRESHOLD = 0.8;
/**
 * 
 * @param {*} marker_id aruco marker
 * @returns true iff the given marker is considered to be in the board, according to APPEAR_THRESHOLD
 */
function isInBoard(marker_id){
  let appear = MARKERS_INFO[marker_id].appear;
  let timesDetected = appear.reduce((a, b) => a + b, 0); 
  let avg = timesDetected / appear.length;
  return avg > APPEAR_THRESHOLD;
}
/**
 * Writes to the UI info about the coin's appear state (times detected, percentage, final decision)
 * @param {*} coin_id marker id of a coin
 */
function updateCoinInfo(coin_id){
  let appear = MARKERS_INFO[coin_id].appear;
  let timesDetected = appear.reduce((a, b) => a + b, 0); 
  let avg = timesDetected / appear.length;
  let decision = avg > APPEAR_THRESHOLD ? 'Still in board': 'Removed';
  let text = `For coin ${coin_id}, detected it ${Math.floor(avg * 100)}% of times. Decision = ${decision}`;

  //Updating UI 
  let divId = `coin-${coin_id}`;
  let div = document.getElementById(divId);
  if (!div){
    let newEl = document.createElement('tr');
    newEl.setAttribute('id', divId);
    coinsSummary.appendChild(newEl);
    div = newEl;
  }  else{
    div.innerHTML = ""; //erase old values
  }
  //adding info
  const create_td = (text) =>{
    let td = document.createElement('td');
    td.innerHTML = text;
    return td;
  }
  let td_coin = create_td(coin_id)
  let td_seen = create_td(`${timesDetected} / ${numFrames}`);
  let td_percentage = create_td(`${Math.floor(avg * 100)}%`);
  let td_decision = create_td(decision);
  div.appendChild(td_coin);
  div.appendChild(td_seen);
  div.appendChild(td_percentage);
  div.appendChild(td_decision);
}
/**
 * Goes through all the bots and move them according to their policy (also assuming)
 * 
 * TODO: This only moves the virtual bots. Need to move the real bot!
 */
function move_bots(){
  for (let bot_id in grid.bots){
      let bot_index = 0;
      let bot = grid.bots[bot_id][bot_index];
      if (bot.isMoving){
          //TODO: This info should be stored in the grid object
          let num_turns = Number(document.getElementById(`coins-policy-turns-${bot_id}`).value);
          grid.move_bot_using_policies(bot_id, bot_index, num_turns)
      }
  }
}
/**
 * Most important method. This will be grabbing a frame from the video stream according to FPS
 * It's responsible for detecting aruco codes, show the 2d projection and keeping track of the virtual grid
 */
function processVideo() {
  if (!cameraController.isCameraActive) {
    return;
  }
  let begin = Date.now();
  context.drawImage(videoObj, 0, 0, width, height);
  let imageData = context.getImageData(0, 0, width, height);
  let markersInfo = cameraController.findArucoCodes(imageData);
  //Only draw when there is frame available
  if (context) {
    cv.imshow("arucoCanvasOutput", cameraController.dst); // canvasOutput is the id of another <canvas>;
    show2dProjection();
    if (!markersInfo) {
      console.log("No markers detected");
    } else {
      if (allCornersFound() && !homographicMatrix) {
        findHomographicMatrix();
      }
      if (positionState === STATES.RECORDING){
        //Just add the marker ids to the set
        for (let marker_id in markersInfo){
          foundArucoIds.add(marker_id);
          currentVectors[marker_id] = markersInfo[marker_id];
        }
      } else if (positionState === STATES.SETUP){

      } else if (positionState === STATES.LOCKED){

      } else {
        console.log(`Invalid position state = ${positionState}`);
      }
      //To keep track of whether the bots are considered in the board
      for (let possible_marker_id in OBJECT_SIZES){
        let appeared = markersInfo[possible_marker_id] ? 1: 0;
        updateMarkerAppear(possible_marker_id, appeared);
      }
      //TODO: Check what part of this deserves to stay
      // for (let possible_marker_id in OBJECT_SIZES){
      //   if (!isInBoard(possible_marker_id)){
      //     if (possible_marker_id in currentVectors){
      //       console.log(`Dont detect marker ${possible_marker_id} from board so also delete it from currentVectors`)
      //       delete currentVectors[possible_marker_id];
      //     }
      //     delete MARKERS_INFO[possible_marker_id].appear; // delete previous appear history
      //     if (!grid){continue};
      //     // If not in board anymore, delete it from the virtual grid
      //     if (possible_marker_id in grid.bots){
      //       grid.remove_bot(possible_marker_id);
      //     } else if (possible_marker_id in grid.obstacles){
      //       grid.remove_obstacle(possible_marker_id)
      //     } else if (possible_marker_id in grid.coins){
      //       grid.remove_coin(possible_marker_id);
      //     }
      //   } else {
      //     //It's still in board
      //     if (grid && possible_marker_id in grid.coins){
      //       updateCoinInfo(possible_marker_id);
      //     }
      //   }
      // }
      // for (let id in markersInfo) {
      //   id = Number(id);
      //   if (IGNORE_IDS.indexOf(id) !== -1) continue;
      //   currentVectors[id] = markersInfo[id];
      //   updateDistanceInfo(id);
      // }
      if (grid){
        updateVirtualObjects();
        move_bots();
        drawBoard();
    }
    }
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}
/**
 * @returns id of the current REAL doodlebot object chosen from the dropdown.
 */
function getCurrentDoodlebot() {
  let id = devicesSelect.value;
  console.log(`Current id of doodlebot found: ${id}`);
  return allDoodlebots[id];
}
/**
 * Doodlebot controllers
 */
connectInternetButton.addEventListener("click", async function () {
  let doodlebot = getCurrentDoodlebot();
  let network = "PRG-MIT";
  let pwd = "JiboLovesPizzaAndMacaroni1";
  doodlebot.connectToWifi(network, pwd);
});
sendCommandButton.addEventListener("click", async function () {
  let doodlebot = getCurrentDoodlebot();
  let commands = botCommand.value;
  doodlebot.sendCommandToRobot(commands);
});
moveToTargetButton.addEventListener("click", async (evt) => {
  let doodlebot = getCurrentDoodlebot();
  log("clicked moveToTargetButton");
  if (!doodlebot) {
    log("Doodlebot not connected yet!");
  }
  let targetId = Number(selectCorners.value);
  let angle = getAngleBetweenMarkers(DOODLEBOT_ID, targetId);
  log(angle);
  angle = Math.floor(angle);
  log("turning...");
  log(angle);
  await doodlebot.turn({ NUM: angle, DIR: "left" });
})
/**
 * Logs the distance between two markers
 * @param {*} id1 aruco marker
 * @param {*} id2 aruco marker
 */
function logDistance(id1, id2) {
  let tvec1 = currentVectors[id1].tvec.data64F;
  let tvec2 = currentVectors[id2].tvec.data64F;
  let diff = [tvec2[0] - tvec1[0], tvec2[1] - tvec1[1], tvec2[2] - tvec1[2]];
  let d = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2]);
  log(`Distance between id ${id1} and ${id2}: ${d}`);
}
/**
 * 
 * @param {*} id aruco marker
 * @returns 2d position of the 3d coordinates (from tvec) of a given marker
 */
function getReal2dPosition(id){
  let point = get2D(currentVectors[id].tvec.data64F);
  let point3D = cv.matFromArray(3, 1, cv.CV_64F, [point[0], point[1], 1]);
  let outPoint3D = new cv.Mat();
  let useless = new cv.Mat(); //to be multiplied by 0
  cv.gemm(homographicMatrix, point3D, 1, useless, 0, outPoint3D);//-rot^t * tvec 
  let [tx, ty, t] = outPoint3D.data64F;
  let outPoint2D = [tx / t, ty / t];
  return outPoint2D;
}
/**
 * logs the 2d position for a given aruco
 * @param {*} id aurco marker 
 */
function log2DPosition(id) {
  let outPoint2D = getReal2dPosition(id);
  log(`2d point for id ${id} = ${outPoint2D}`);
}
lengthTestButton.addEventListener("click", () => {
  logDistance(BORDER_IDS.BOTTOM_LEFT, BORDER_IDS.BOTTOM_RIGHT);
  logDistance(BORDER_IDS.BOTTOM_RIGHT, BORDER_IDS.TOP_RIGHT);
  logDistance(BORDER_IDS.TOP_RIGHT, BORDER_IDS.TOP_LEFT);
  logDistance(BORDER_IDS.TOP_LEFT, BORDER_IDS.BOTTOM_LEFT);

  log2DPosition(DOODLEBOT_ID);

  log2DPosition(BORDER_IDS.BOTTOM_LEFT);
  log2DPosition(BORDER_IDS.BOTTOM_RIGHT);
  log2DPosition(BORDER_IDS.TOP_RIGHT);
  log2DPosition(BORDER_IDS.TOP_LEFT);
})
// // # Checks if a matrix is a valid rotation matrix.
// function isRotationMatrix(R){
//     let Rt = cv.transpose(R)
//     let shouldBeIdentity = cv.dot(Rt, R)
//     let I = cv.identity(3, dtype = R.dtype)
//     let n = np.linalg.norm(I - shouldBeIdentity)
//     return n < 1e-6
// }

// # Calculates rotation matrix to euler angles
// # The result is the same as MATLAB except the order
// # of the euler angles ( x and z are swapped ).
/**
 * From https://gist.github.com/nouyang/c08202f97c607e2e6b7728577ffcb47f
 * @param {*} R 
 * @returns 
 */
function rotationMatrixToEulerAngles(R) {
  console.log(R);
  // if (!isRotationMatrix(R)){
  //   console.log("Oops... his rotation should be a rotation matrix!")
  // }

  let sy = Math.sqrt(R[0, 0] * R[0, 0] + R[1, 0] * R[1, 0]);

  let singular = sy < 1e-6;
  let x, y, z;
  if (!singular) {
    console.log("Not singular!")
    x = Math.atan2(R[2, 1], R[2, 2])
    y = Math.atan2(-R[2, 0], sy)
    z = Math.atan2(R[1, 0], R[0, 0])
  } else {
    console.log("Singular!")
    x = Math.atan2(-R[1, 2], R[1, 1])
    y = Math.atan2(-R[2, 0], sy)
    z = 0
  }
  let rots = cv.array([x, y, z])
  rots = cv.array(rots.map(r => Math.degrees(r)));

  rots[0] = 180 - rots[0] % 360;
  return rots
}

/**
 * Moving doodlebot to another aruco marker
 */
async function moveToId2() {
  // await doodlebot.turn({NUM: 90, DIR: 'left'});
  // return;
  let targetId = 12;
  //.data64F

  let tvecMain = currentVectors[doodlebotId].tvec;
  let rvecMain = currentVectors[doodlebotId].rvec;
  let tvecTarget = currentVectors[targetId].tvec;
  let rvecTarget = currentVectors[targetId].rvec;

  // Taken from https://gist.github.com/nouyang/c08202f97c607e2e6b7728577ffcb47f
  // console.log(cv.Rodrigues(rvecMain.data64F));
  // let [rotMatMain, _] = cv.Rodrigues(rvecMain.data64F)
  // // Convert rotation matrix to Euler angles
  // let rotEulerMain = rotationMatrixToEulerAngles(rotMatMain);
  // console.log("rot main")
  // console.log(rotEulerMain);

  // let [rotMatTarget, jacob] = cv.Rodrigues(rvecTarget.data64F)
  // // Convert rotation matrix to Euler angles
  // let rotEulerTarget = rotationMatrixToEulerAngles(rotMatTarget);
  // console.log("Rotation target");
  // console.log(rotEulerTarget);


  // outputAngles[tagID] = rotEuler

  // let rvecMain = [-3.7195063552832623, -0.10989225290660916, 0.17695534177875263];
  // let rvecTarget = [1.954939317161549, -1.7508779320986085, -0.1784025137313462];

  // let tvecMain = [0.5760413593867371, -0.6323721267558076, 4.328362180633164];
  // let tvecTarget = [-0.35091584404477083, -0.5745699655159148, 5.6107845983698565];

  let dx = rvecTarget.data64F[0] - rvecMain.data64F[0];
  let dy = rvecTarget.data64F[1] - rvecMain.data64F[1]
  // let dx = tvecMain[0] - tvecTarget[0] + rvecMain[0];
  // let dy = tvecMain[1] - tvecTarget[1] + rvecMain[1];

  let angle = Math.atan2(dy, dx);
  angle = angle * 180 / Math.PI; //should be close to 90
  this.log(`Will turn ${angle}`)
  // await doodlebot.turn({NUM: angle, DIR: 'right'});

}
multipleCommandsTestButton.addEventListener("click", async (evt) => {
  let doodlebot = getCurrentDoodlebot();

  //Measured by hand
  let realWidthInches = 12.5;
  let realHeightInches = 7;
  let nStepsWidth = Math.floor(realWidthInches / INCHES_PER_STEP);
  let nStepsHeight = Math.floor(realHeightInches / INCHES_PER_STEP);
  log(`nStepsWidth = ${nStepsWidth}, nStepsHeight = ${nStepsHeight}`);
  if (!doodlebot) {
    log(`Doodlebot not connected yet!`);
    return;
  }
  // await doodlebot.turn({NUM: 90, DIR:"right"})
  await doodlebot.drive({ NUM: nStepsWidth });
  await doodlebot.turn({ NUM: 90, DIR: "left" })
  await doodlebot.drive({ NUM: nStepsHeight })
  await doodlebot.turn({ NUM: 90, DIR: "left" })
  await doodlebot.drive({ NUM: nStepsWidth })
  await doodlebot.turn({ NUM: 90, DIR: "left" })
  await doodlebot.drive({ NUM: nStepsHeight })
  await doodlebot.turn({ NUM: 180, DIR: "left" })

})
/**
 * Logs message in the 'logBox' textarea
 * @param {*} message 
 */
function log(message) {
  logBox.value = message + "\n" + logBox.value;
}
/**
 * Callback to handle received values that come from the doodlebot
 * @param {*} evt the received event
 */
function onReceiveValue(evt) {
  const view = evt.target.value;
  log("Received:");
  var enc = new TextDecoder("utf-8"); // always utf-8
  log(enc.decode(view.buffer));
}
/**
 * Setup doodlebot connections and add it as a select option in the UI
 * TODO: Since tis doesnt seem to be called anywehre else than in onRequestBluetoothDeviceButtonClick,
 * check if al this logic could be moved there
 * @param {*} newDoodlebot a Doodlebot object
 */
async function populateBluetoothDevices(newDoodlebot) {
  if (!newDoodlebot) { return; }
  try {
    log("Trying to connect...");
    await newDoodlebot.connect();
    const devicesSelect = document.querySelector("#devicesSelect");
    const option = document.createElement("option");
    option.value = newDoodlebot.bot.id;
    option.textContent = newDoodlebot.bot.name;
    devicesSelect.appendChild(option);
  } catch (error) {  
    log("Argh! " + error);
  }
}
moveRobot1.addEventListener("click", async() =>{
  let id1 = "PBFfpAWAdswsv6zvQ3Q5zQ=="; //hardcoded
  await allDoodlebots[id1].drive({NUM:100});
  await allDoodlebots[id1].drive({NUM:50});
})
moveRobot2.addEventListener("click", async() =>{
  let id2 = "UJJh1Y3QIudHi3g9PkXhBg=="; //hardcoded
  await allDoodlebots[id2].drive({NUM:200});
  await allDoodlebots[id2].drive({NUM:100});

})
multipleRobotsTestButton.addEventListener("click", async () => {
  for (let key in allDoodlebots) {
    let bot = allDoodlebots[key];
    await bot.drive({ NUM: 100 });
    await bot.turn({ NUM: 90 })
  }
})

/**Workers stuff, removing for now */
// function onLog(data){
//   let {message} = data;
//   log(message);
// }
// function onCreate(worker, data){
//   let {id, name} = data;
//   allWorkers[id] = data;
//   console.log("Worker saved!");
//   console.log(allWorkers);

//   const devicesSelect = document.querySelector("#devicesSelect");
//   const option = document.createElement("option");
//   option.value = id;
//   option.textContent = name;
//   devicesSelect.appendChild(option);
// }
// const CALLBACK_METHODS = {
//   create: onCreate,
//   log: onLog,
// }
// async function request_device() {
//   log("Requesting any Bluetooth device...");
//   // const device = RobotBLE.requestRobot(bluetooth, "Doodlebooth Frida");
//   const device = await navigator.bluetooth.requestDevice({
//     filters: [{ services: [UartService.uuid] }], // <- Prefer filters to save energy & show relevant devices.
//     //   acceptAllDevices: true,
//   });

//   log("> Requested " + device.name + " (" + device.id + ")");

//   let bot = device;


//   return device;
// }
async function onRequestBluetoothDeviceButtonClick() {
  try {
    // let tempWorker = new Worker("bot_worker.js");
    // /**Initialize worker with its callbacks */
    // tempWorker.addEventListener('message', (e) => {
    //       let {type, res} = e.data;
    //       if (!CALLBACK_METHODS[type]){
    //           console.log(`[index.js] No valid method type: ${type}`)
    //       } else{
    //           //passing the data (and the worker) to the method bounded by the type we have
    //           CALLBACK_METHODS[type](this, res);
    //       }
    // })
    // let bot = await request_device();
    // console.log("[main.js] Gotten bot:");
    // console.log(bot);

    // tempWorker.postMessage({type:"create", data:{bot: bot}}); //Telling worker to setup the doodlebot

    let newDoodlebot = new Doodlebot(log, onReceiveValue);
    await newDoodlebot.request_device();
    console.log(`Added id with ${newDoodlebot.bot.id}`);
    allDoodlebots[newDoodlebot.bot.id] = newDoodlebot; // Saving object
    populateBluetoothDevices(newDoodlebot);
  } catch (error) {
    log("Argh! " + error);
  }
}
