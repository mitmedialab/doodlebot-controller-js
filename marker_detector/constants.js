let cameraMatrix;
let distCoeffs;
let cameraConstraints = {
  audio: false,
  video: {
    width: 640,
    height: 360,
    frameRate: 30,
    deviceId:
      "900a49dfda6bfee6faf44cbb6b6b1cd7477dccb9c7ac304255fbac5c8d81f3d0",
  },
};
const FPS = 30;

if (typeof cv !== "undefined") {
  onReadyConstants();
} else {
  document
    .getElementById("opencvjs")
    .addEventListener("load", onReadyConstants);
}
async function onReadyConstants() {
  cv = await cv;
  console.log("cv found:")
  console.log(cv);
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
