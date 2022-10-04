let cameraController;
let videoObj = document.getElementById("videoId");
let width = videoObj.width;
let height = videoObj.height;
let context = arucoCanvasOutput.getContext("2d");

if (typeof cv !== "undefined") {
  onReady();
} else {
  document.getElementById("opencvjs").addEventListener("load", onReady);
}
deactivateCameraButton.addEventListener("click", (evt) => {
  cameraController.deactivateCamera();
});

activateCameraButton.addEventListener("click", async (evt) => {
  let stream = await cameraController.activateCamera();
  videoObj.srcObject = stream;
  processVideo();
});
function onReady() {
  document.getElementById("activateCameraButton").disabled = false;
  document.getElementById("deactivateCameraButton").disabled = false;
  console.log(cv.__version__);
  cameraController = new CameraController(
    cameraMatrix,
    distCoeffs,
    height,
    width,
    cameraConstraints
  );
}

function processVideo() {
  if (!cameraController.isCameraActive) {
    return;
  }
  let begin = Date.now();
  // let canvasFrame = document.getElementById("arucoCanvasOutput"); // canvasFrame is the id of <canvas>

  context.drawImage(videoObj, 0, 0, width, height);
  let imageData = context.getImageData(0, 0, width, height);
  console.log(imageData);
  let markersInfo = cameraController.findArucoCodes(imageData);
  if (context && !markersInfo) {
    console.log("No markers detected");
    //nothing detected
    // return;
  } else {
    // console.log("Markers info:");
    // console.log(markersInfo);
  }
  //Only draw when there is frame available
  if (context) {
    cv.imshow("arucoCanvasOutput", cameraController.dst); // canvasOutput is the id of another <canvas>;
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}
