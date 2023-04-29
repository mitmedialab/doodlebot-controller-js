let cameraMatrix;
let distCoeffs;
let cameraConstraints = {
  audio: false,
  video: {
    // width: 640,
    // height: 640,
    frameRate: 30,
    kind: "videoinput",
    // label:"Logitech Webcam C930e (046d:0843)",
    // label:"FaceTime HD Camera",
    // deviceId:"47c765e31952fa817677e9d006e3cf9e47a9169200620d3109729bc3a88e7790",
    deviceId:
      "08077cf851c532d64221ed33018a1f4bb27fadc7c0d0a68e66a7665e0d17beda",
    // deviceId: "7637fb1fef82ff97f0e3e9fcd0ef18375d66bb68401ad2cd61de93801f93f0e9"
    // deviceId: "08077cf851c532d64221ed33018a1f4bb27fadc7c0d0a68e66a7665e0d17beda",
    // deviceId:  "7637fb1fef82ff97f0e3e9fcd0ef18375d66bb68401ad2cd61de93801f93f0e9",
    // deviceId: "a3837b37f5af6c8e3f4523eef6245c94a65ab2abc7272055dc1926400f39f9f9"
    // deviceId: "89246cbb3896e89e80324c97b452a4617b4192d153c79cde9a78ad2cbc4122c3"
  },
};
const FPS = 30; //15; //30;
const INCHES_PER_STEP = 0.055; //Number from Franklin

if (typeof cv !== "undefined") {
  onReadyConstants();
} else {
  document
    .getElementById("opencvjs")
    .addEventListener("load", onReadyConstants);
}
async function onReadyConstants() {
  cv = await cv;
  console.log("cv found:");
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
  //Values from other repo
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
  //Values from lab camera using video2calibration
  if (false) {
    cameraMatrix = cv.matFromArray(
      3,
      3,
      cv.CV_64F,
      [
        803.6482346316369, 0, 622.0533724011025, 0, 803.2871202639438,
        352.18308586907744, 0, 0, 1,
      ]
    );
    distCoeffs = cv.matFromArray(
      5,
      1,
      cv.CV_64F,
      [
        0.08798626671471771, -0.21986096551594153, 0.00038579093799327664,
        0.003067987420044901, 0.08999487132382833,
      ]
    );
  }
}

export { cameraMatrix, distCoeffs, cameraConstraints, FPS };
