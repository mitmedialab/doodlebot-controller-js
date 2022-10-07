let doodlebot;
let cameraController;
let videoObj = document.getElementById("videoId");
let width = videoObj.width;
let height = videoObj.height;
let context = arucoCanvasOutput.getContext("2d");
let currentVectors = {}; //id -> {rvec: , tvec: }
let angles = {} //id -> angle (from doodlebot to id)
let DOODLEBOT_ID = 1; //id of marker

/**
 * Camera controllers
 */
if (typeof cv !== "undefined") {
  onReady();
} else {
  document.getElementById("opencvjs").addEventListener("load", onReady);
}

async function onReady(){
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
}
deactivateCameraButton.addEventListener("click", (evt) => {
  cameraController.deactivateCamera();
});

activateCameraButton.addEventListener("click", async (evt) => {
  let stream = await cameraController.activateCamera();
  videoObj.srcObject = stream;
  processVideo();
});

function getAngleBetweenMarkers(sourceId, targetId){
  if (!currentVectors[sourceId] || !currentVectors[targetId]){
    console.log(`Both source (id = ${sourceId}) and target (id = ${targetId}) should be present in currentVectors!`);
    console.log(currentVectors);
    return;
  }
  let infoSource = currentVectors[sourceId];
  let infoTarget = currentVectors[targetId];
  let rvecSource = infoSource.rvec;
  let tvecSource = infoSource.tvec;
  let rvecTarget = infoSource.rvec;
  let tvecTarget = infoSource.tvec;

  let dx = rvecTarget.data64F[0] - rvecSource.data64F[0];
  let dy = rvecTarget.data64F[1] - rvecSource.data64F[1];

  let angle = Math.atan2(dy, dx);
  angle = angle * 180 / Math.PI; //should be close to 90
  return angle;
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
    cv.imshow("arucoCanvasOutput", cameraController.dst); // canvasOutput is the id of another <canvas>;

    if (!markersInfo){
      console.log("No markers detected");
    } else {
      //Updating found vectors to global vectors
      if (markersInfo[DOODLEBOT_ID]){
        currentVectors[DOODLEBOT_ID] = markersInfo[DOODLEBOT_ID];
      }
      for (let id in markersInfo){
        if (id === DOODLEBOT_ID) continue;
        currentVectors[id] = markersInfo[id];
        let angle = getAngleBetweenMarkers(DOODLEBOT_ID, id);
        // console.log(`Angle found = ${angle}`);

      }
    }
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}

/**
 * Doodlebot controllers
 */
connectInternetButton.addEventListener("click", async function () {
  let network = "PRG-MIT";
  let pwd = "JiboLovesPizzaAndMacaroni1";
  doodlebot.connectToWifi(network, pwd);
});
sendCommandButton.addEventListener("click", async function () {
  let commands = botCommand.value;
  doodlebot.sendCommandToRobot(commands);
});
moveToTargetButton.addEventListener("click", async (evt)=>{
  await this.moveToId();
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
function rotationMatrixToEulerAngles(R){
    console.log(R);
    // if (!isRotationMatrix(R)){
    //   console.log("Oops... his rotation should be a rotation matrix!")
    // }

    let sy = Math.sqrt(R[0,0] * R[0,0] +  R[1,0] * R[1,0]);

    let singular = sy < 1e-6;
    let x, y, z;
    if (!singular){
        console.log("Not singular!")
        x = Math.atan2(R[2,1] , R[2,2]) 
        y = Math.atan2(-R[2,0], sy)  
        z = Math.atan2(R[1,0], R[0,0]) 
    } else{
        console.log("Singular!")
        x = Math.atan2(-R[1,2], R[1,1])
        y = Math.atan2(-R[2,0], sy)
        z = 0
    }
    let rots = cv.array([x, y, z])
    rots = cv.array(rots.map(r => Math.degrees(r)));

    rots[0] = 180 - rots[0] % 360;
    return rots 
}

async function moveToId(){
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

function log(message) {
  logBox.value = message + "\n" + logBox.value;
}
function onReceiveValue(evt) {
  const view = evt.target.value;
  log("Received:");
  var enc = new TextDecoder("utf-8"); // always utf-8
  log(enc.decode(view.buffer));
}
async function populateBluetoothDevices() {
  try {
    log("Trying to connect...");
    await doodlebot.connect();
    const devicesSelect = document.querySelector("#devicesSelect");
    const option = document.createElement("option");
    option.value = doodlebot.bot.id;
    option.textContent = doodlebot.bot.name;
    devicesSelect.appendChild(option);
  } catch (error) {
    log("Argh! " + error);
  }
}
async function onRequestBluetoothDeviceButtonClick() {
  try {
    doodlebot = new Doodlebot(log, onReceiveValue);
    await doodlebot.request_device();
    populateBluetoothDevices();
  } catch (error) {
    log("Argh! " + error);
  }
}
