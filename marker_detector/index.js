let videoObj = document.getElementById("videoId");
let width = videoObj.width;
let height = videoObj.height;
let src;
let dst;
let cameraMatrix;
let distCoeffs;
let stopCamera = true;

let canvasFrame = document.getElementById("arucoCanvasOutput"); // canvasFrame is the id of <canvas>
let context = canvasFrame.getContext("2d");

const FPS = 30;

let constraints = {
  audio: false,
  video: {
    width: 640,
    height: 360,
    frameRate: 30,
    deviceId:
      "900a49dfda6bfee6faf44cbb6b6b1cd7477dccb9c7ac304255fbac5c8d81f3d0",
  },
};
function onReady() {
  document.getElementById("buttonId").disabled = false;
  document.getElementById("deactivateCameraButton").disabled = false;
  console.log(cv.__version__);
  src = new cv.Mat(height, width, cv.CV_8UC4);
  dst = new cv.Mat(height, width, cv.CV_8UC1);
  /*Camera values*/
  cameraMatrix = cv.matFromArray(
    3,
    3,
    cv.CV_64F,
    [
      1181.1162112265451, 0.0, 948.8233981926403, 0.0, 1181.6472180982591,
      541.2092582739663, 0.0, 0.0, 1.0,
    ]
  );
  distCoeffs = cv.matFromArray(
    5,
    1,
    cv.CV_64F,
    [
      0.19174712176744907, -0.08277619494389733, 0.0015721897019070517,
      0.011591628661818381, -1.5351916635013496,
    ]
  );
  cameraMatrix = cv.matFromArray(
    3,
    3,
    cv.CV_64F,
    [
      9.6635571716090658e2, 0, 2.0679307818305685e2, 0, 9.6635571716090658e2,
      2.9370020600555273e2, 0, 0, 1,
    ]
  );
  distCoeffs = cv.matFromArray(
    5,
    1,
    cv.CV_64F,
    [
      -1.5007354215536557e-3, 9.8722389825801837e-1, 1.7188452542408809e-2,
      -2.6805958820424611e-2, -2.3313928379240205,
    ]
  );
}
if (typeof cv !== "undefined") {
  onReady();
} else {
  document.getElementById("opencvjs").onload = onReady;
}
deactivateCameraButton.addEventListener("click", (evt) => {
  stopCamera = true;
});
async function activateCamera() {
  stopCamera = false;
  let stream = null;
  try {
    stream = await window.navigator.mediaDevices.getUserMedia(constraints);
    /* use the stream */
    // let videoObj = document.getElementById("videoObj");
    videoObj.srcObject = stream;
    processVideo();
  } catch {
    function handle(err) {
      console.log(err);
    }
  }
}
function processVideo() {
  if (stopCamera) {
    return true;
  }
  let begin = Date.now();
  context.drawImage(videoObj, 0, 0, width, height);
  let imageData = context.getImageData(0, 0, width, height);
  let markersInfo = findArucoCodes(
    imageData,
    src,
    dst,
    cameraMatrix,
    distCoeffs
  );
  if (!markersInfo) {
    console.log("No markers detected");
    //nothing detected
    // return;
  } else {
    console.log("Markers info:");
    console.log(markersInfo);
  }
  //Only draw when there is frame available
  if (context) {
    cv.imshow("arucoCanvasOutput", dst); // canvasOutput is the id of another <canvas>;
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}
/**
 * Takes the data from one Canvas and writes it to another Canvas
 * @param {*} imageData
 * @param {*} src Matrix
 * @param {*} dst Matrix
 */
function findArucoCodes(imageData, src, dst, cameraMatrix, distCoeffs) {
  //   let src = new cv.Mat(height, width, cv.CV_8UC4);
  //   let dst = new cv.Mat(height, width, cv.CV_8UC1);
  src.data.set(imageData.data);
  cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB, 0);
  let dictionary = new cv.Dictionary(cv.DICT_6X6_250);
  let markerCorners = new cv.MatVector();
  let markerIds = new cv.Mat();
  cv.detectMarkers(dst, dictionary, markerCorners, markerIds);
  all_markers = [];
  if (markerIds.rows === 0) {
    //Nothing detected
    return;
  }
  let response = {
    ids: [],
    rvecs: [],
    tvecs: [],
  };
  cv.drawDetectedMarkers(dst, markerCorners, markerIds);
  let rvecs = new cv.Mat();
  let tvecs = new cv.Mat();
  cv.estimatePoseSingleMarkers(
    markerCorners,
    0.1,
    cameraMatrix,
    distCoeffs,
    rvecs,
    tvecs
  );
  for (let i = 0; i < markerIds.rows; i++) {
    let rvec = cv.matFromArray(3, 1, cv.CV_64F, [
      rvecs.doublePtr(0, i)[0],
      rvecs.doublePtr(0, i)[1],
      rvecs.doublePtr(0, i)[2],
    ]);
    let tvec = cv.matFromArray(3, 1, cv.CV_64F, [
      tvecs.doublePtr(0, i)[0],
      tvecs.doublePtr(0, i)[1],
      tvecs.doublePtr(0, i)[2],
    ]);
    cv.drawAxis(dst, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
    let marker_id = markerIds.data[4 * i]; //TODO: FIgure out a way this can generalize for bigger ids
    response["ids"].push(marker_id);
    response["rvecs"].push(rvec);
    response["tvecs"].push(tvec);
    // rvec.delete();
    // tvec.delete();
  }
  // console.log("rvecs");
  // console.log(rvecs);
  // console.log("tvecs");
  // console.log(tvecs);

  return response;
}
