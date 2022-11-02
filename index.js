// console.log = (x, r)=>{if (r){}};

// let doodlebot;
let allDoodlebots = {}; // id -> doodlebot object
let cameraController;
let videoObj = document.getElementById("videoId");
let width = videoObj.width;
let height = videoObj.height;
let context = arucoCanvasOutput.getContext("2d", { willReadFrequently: true });
let currentVectors = {}; //id -> {rvec: , tvec: }
let angles = {} //id -> angle (from doodlebot to id)
let DOODLEBOT_ID = 1; //id of marker
let homographicMatrix;
let showAruco = true; // if false show the projected value

//8, 9, 10, 12
let BORDER_IDS = {
  BOTTOM_LEFT: 8,  //bottom left
  BOTTOM_RIGHT: 9, // bottom righ
  TOP_RIGHT: 10, //top right
  TOP_LEFT: 12 //top left
}
IGNORE_IDS = [1]; //, 8, 9, 10, 12]; //doodlebot + borders
/**
 * Camera controllers
 */
if (typeof cv !== "undefined") {
  onReady();
} else {
  document.getElementById("opencvjs").addEventListener("load", onReady);
}

async function onReady() {
  console.log("Index on Ready");
  cv = await cv;
  document.getElementById("activateCameraButton").disabled = false;
  document.getElementById("deactivateCameraButton").disabled = false;
  console.log(cv);
  console.log(cv.Rodrigues);
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
  processVideo();
});
switchViewButton.addEventListener("click", (evt) => {
  showAruco = !showAruco;
})
updateBoard.addEventListener("click", findHomographicMatrix);
let markerSize = 0.1;

/**
 *
 * @param {*} rvec 
 * @returns  The 2d angle direction of the rotation vector
 */
function getRotation2DAngle(rvec) {
  // let center2D = get2D(tvec.data64F);

  // let halfSide = markerSize / 2;

  let rot = new cv.Mat();
  cv.Rodrigues(rvec, rot);
  // let inv = new cv.Mat();
  // cv.transpose(rot, inv);
  // console.log('rot');
  // console.log(rot);
  //TODO: Figure out if you only need to do the 2d projection of the direction 
  let dir = rot.row(1).data64F; // * halfSide;
  let dir2D = get2D(dir);
  // let middleTop = tvec.data64F + dir;
  // let middleTop2D = get2D(middleTop);

  // let dx = middleTop[0] - center2D[0];
  // let dy = middleTop[1] - center2D[1];
  let angle = Math.atan2(dir2D[1], dir2D[0]);
  angle = angle * 180 / Math.PI;
  if (angle < 0) { angle += 360; } //Make sure angle is on [0. 360)
  return angle;
}
function getCameraCoordinates(rvec, tvec) {
  let half_side = markerSize / 2;

  let rot = new cv.Mat();
  cv.Rodrigues(rvec, rot);
  let inv = new cv.Mat();
  cv.transpose(rot, inv);
  console.log('inv');
  console.log(inv);
  let coords = new cv.Mat();
  let useless = new cv.Mat(); //to be multiplied by 0
  cv.gemm(inv, tvec, -1, useless, 0, coords);//-rot^t * tvec 
  // cv.multiply(inv, tvec, coords, -1);

  // cv.multiply(inv,tvec, coords); //Need to multiply times -1
  console.log(coords);
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
  out = out.data64F;
  return out;
}
function findHomographicMatrix() {
  // let srcTri2 = cv.matFromArray(4, 1, cv.CV_32FC2, [56, 65, 368, 52, 28, 387, 389, 390]);
  // let dstTri2 = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, 300, 0, 0, 300, 300, 300]);
  // let M = cv.getPerspectiveTransform(srcTri2, dstTri2);
  // return M;

  let worldx = 640;//3;
  let worldy = 360; //2;
  // let bl, br, tr, tl;
  if (
    !currentVectors[BORDER_IDS.BOTTOM_LEFT] ||
    !currentVectors[BORDER_IDS.BOTTOM_RIGHT] ||
    !currentVectors[BORDER_IDS.TOP_RIGHT] ||
    !currentVectors[BORDER_IDS.TOP_LEFT]
  ) {
    console.log("Not 4 corners have been found yet");
    return;
  }
  let bl = get2D(currentVectors[BORDER_IDS.BOTTOM_LEFT].tvec.data64F);
  let br = get2D(currentVectors[BORDER_IDS.BOTTOM_RIGHT].tvec.data64F);

  let tr = get2D(currentVectors[BORDER_IDS.TOP_RIGHT].tvec.data64F);
  let tl = get2D(currentVectors[BORDER_IDS.TOP_LEFT].tvec.data64F);


  console.log("bottom left info:")
  console.log(bl);
  console.log(br);
  console.log(tr);
  console.log(tl);

  let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [bl[0], bl[1], br[0], br[1], tl[0], tl[1], tr[0], tr[1]]);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, worldx, 0, 0, worldy, worldx, worldy]);
  homographicMatrix = cv.getPerspectiveTransform(srcTri, dstTri); //cv.findHomography(srcTri, dstTri);
}
function show2dProjection() {
  if (!homographicMatrix) {
    log("Cannot do until homographicMatrix is defined");
    return;
  }
  if (!cameraController.src || !cameraController.src.data) {
    log('Src canvas not ready..')
    return;
  }
  // let canvasOut = new cv.Mat(cameraController.height, cameraController.width, cv.CV_8UC1);
  try {
    let canvasOut = new cv.Mat();
    // let src = new cv.Mat(height, width, cv.CV_8UC4);
    // src.data.set(cameraController.src.data);

    let dsize = new cv.Size(width, height); //new cv.Size(cameraController.src.cols, cameraController.src.rows);
    cv.warpPerspective(cameraController.src, canvasOut, homographicMatrix, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
    cv.imshow("arucoCanvasOutput", canvasOut); // canvasOutput is the id of another <canvas>;
    return;
  } catch (e) {
    log("[show2dProjection] Uh oh..there was an error:");
    log(e);
    return
  }
  // return;




  // let src = [[bl[0], bl[1]], [br[0], br[1]], [tr[0], tr[1]], [tl[0], tl[1]]];
  let src = [[bl[0], bl[1]], [br[0], br[1]], [tr[0], tr[1]], [tl[0], tl[1]]]
  src = cv.matFromArray(
    4,
    2,
    cv.CV_64F,
    [].concat(...src)
  )
  console.log(src)

  // let src = new cv.Mat([[bl[0], bl[1]], [br[0], br[1]], [tr[0], tr[1]], [tl[0], tl[1]]]);
  let dst = [[0.0, 0.0], [worldx, 0.0], [0.0, worldy], [worldx, worldy]];
  dst = cv.matFromArray(
    4,
    2,
    cv.CV_64F,
    [].concat(...dst)
  )
  console.log(dst)
  // let dst = new cv.Mat([[0.0, 0.0], [worldx, 0.0], [0.0, worldy], [worldx, worldy]]);

  let H = cv.findHomography(src, dst);
  console.log("H:");
  console.log(H);
  return H;


}
function getAngleBetweenMarkers2(sourceId, targetId, imageData) {
  if (!cameraController) { return; }
  let worldx = 3;
  let worldy = 2;

  // let H = getHomographyMatrix();
  console.log('Found matrix');
  console.log(H);
  // console.log(cameraController.src)
  // cameraController.src.data.set(imageData.data);

  // let canvasOut = new cv.Mat(cameraController.height, cameraController.width, cv.CV_8UC1);
  let canvasOut = new cv.Mat();
  let dsize = new cv.Size(cameraController.src.cols, cameraController.src.rows);
  cv.warpPerspective(cameraController.src, canvasOut, H, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());


  // let canvasOut = new cv.Mat(worldx, worldy, cv.CV_8UC1);

  // cv.cvtColor(cameraController.src, canvasOut, cv.COLOR_RGBA2RGB, 0);
  // console.log(canvasOut)
  // let size = new cv.Size(cameraController.width, cameraController.height);
  // console.log(size);
  // cv.warpPerspective(cameraController.src, canvasOut, H, size);
  // console.log(canvasOut);
  cv.imshow("arucoCanvasOutput2", canvasOut); // canvasOutput is the id of another <canvas>;


}

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
function getAngleBetweenMarkers(sourceId, targetId) {
  // return Math.floor(Math.random() * 100)
  if (!currentVectors[sourceId] || !currentVectors[targetId]) {
    console.log(`Both source (id = ${sourceId}) and target (id = ${targetId}) should be present in currentVectors!`);
    console.log(currentVectors);
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
function updateDistanceInfo(id, imageData) {
  let angle = getAngleBetweenMarkers(DOODLEBOT_ID, id, imageData);
  // console.log(`Angle found between ${id} and doodlebot = ${angle}`);

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
function allCornersFound() {
  for (let key in BORDER_IDS) {
    if (!currentVectors[BORDER_IDS[key]]) {
      return false;
    }
  }
  return true;
}
function processVideo() {
  if (!cameraController.isCameraActive) {
    return;
  }
  let begin = Date.now();
  context.drawImage(videoObj, 0, 0, width, height);
  let imageData = context.getImageData(0, 0, width, height);
  let markersInfo = cameraController.findArucoCodes(imageData);
  // console.log(markersInfo);
  //Only draw when there is frame available
  if (context) {
    if (showAruco) {
      cv.imshow("arucoCanvasOutput", cameraController.dst); // canvasOutput is the id of another <canvas>;
    } else {
      show2dProjection();
    }


    if (!markersInfo) {
      console.log("No markers detected");
    } else {
      if (allCornersFound() && !homographicMatrix) {
        findHomographicMatrix();
      }
      //Updating important vectors first
      for (let important_id of IGNORE_IDS) {
        if (markersInfo[important_id]) {
          currentVectors[important_id] = markersInfo[important_id];
        }
      }
      //Update non-importan vectors now
      for (let id in markersInfo) {
        id = Number(id);
        if (IGNORE_IDS.indexOf(id) !== -1) continue;
        currentVectors[id] = markersInfo[id];
        updateDistanceInfo(id, imageData);

      }
      // console.log("Values:")
      // let bl = get2D(currentVectors[BORDER_IDS["BOTTOM_LEFT"]].tvec.data64F);
      // for (let key in BORDER_IDS){
      //   console.log(key);
      //   let v = get2D(currentVectors[BORDER_IDS[key]].tvec.data64F);
      //   console.log(`[${v[0]-bl[0]}, ${v[1]-bl[1]}]`);
      // }
    }
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}
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

function logDistance(id1, id2) {
  let tvec1 = currentVectors[id1].tvec.data64F;
  let tvec2 = currentVectors[id2].tvec.data64F;
  let diff = [tvec2[0] - tvec1[0], tvec2[1] - tvec1[1], tvec2[2] - tvec1[2]];
  let d = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1] + diff[2] * diff[2]);
  log(`Distance between id ${id1} and ${id2}: ${d}`);
}
function log2DPosition(id) {
  let point = get2D(currentVectors[id].tvec.data64F);
  let point3D = cv.matFromArray(3, 1, cv.CV_64F, [point[0], point[1], 1]);
  let outPoint3D = new cv.Mat();

  let useless = new cv.Mat(); //to be multiplied by 0
  cv.gemm(homographicMatrix, point3D, 1, useless, 0, outPoint3D);//-rot^t * tvec 

  let [tx, ty, t] = outPoint3D.data64F;
  let outPoint2D = [tx / t, ty / t];
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

async function moveToId(targetId) {

}
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
function log(message) {
  logBox.value = message + "\n" + logBox.value;
}
function onReceiveValue(evt) {
  const view = evt.target.value;
  log("Received:");
  var enc = new TextDecoder("utf-8"); // always utf-8
  log(enc.decode(view.buffer));
}
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

multipleRobotsTestButton.addEventListener("click", async () => {
  for (let key in allDoodlebots) {
    let bot = allDoodlebots[key];
    await bot.drive({ NUM: 100 });
    await bot.turn({ NUM: 90 })
  }
})
async function onRequestBluetoothDeviceButtonClick() {
  try {
    let newDoodlebot = new Doodlebot(log, onReceiveValue);
    await newDoodlebot.request_device();
    allDoodlebots[newDoodlebot.bot.id] = newDoodlebot; // Saving object
    populateBluetoothDevices(newDoodlebot);
  } catch (error) {
    log("Argh! " + error);
  }
}
