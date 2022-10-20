function diff(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

class CameraController {
  constructor(cameraMatrix, distCoeffs, height, width, cameraConstraints) {
    console.log("start");
    console.log(cameraMatrix);
    console.log(distCoeffs);
    console.log(height);
    console.log(width);
    console.log(cameraConstraints);
    console.log("yay!");
    this.cameraMatrix = cameraMatrix;
    this.distCoeffs = distCoeffs;
    this.isCameraActive = false;
    this.height = height;
    this.width = width;
    this.cameraConstraints = cameraConstraints;
    this.stream = null;

    this.src = new cv.Mat(height, width, cv.CV_8UC4);
    this.dst = new cv.Mat(height, width, cv.CV_8UC1);
  }
  async activateCamera() {
    this.isCameraActive = true;
    try {
      this.stream = await window.navigator.mediaDevices.getUserMedia(
        this.cameraConstraints
      );
      console.log(this.cameraConstraints);
      console.log(this.stream);
      return this.stream; //TODO: use it for videoObj.srcObject = stream;
    } catch {
      function handle(err) {
        console.log(err);
      }
    }
  }
  deactivateCamera() {
    this.isCameraActive = false;
  }

  /**
   * Takes the data from one Canvas and writes it to another Canvas
   * @param {*} imageData
   * @param {*} src Matrix
   * @param {*} dst Matrix
   */
  findArucoCodes(imageData) {
    //, cameraMatrix, distCoeffs) {
    //   let src = new cv.Mat(height, width, cv.CV_8UC4);
    //   let dst = new cv.Mat(height, width, cv.CV_8UC1);
    this.src.data.set(imageData.data);
    cv.cvtColor(this.src, this.dst, cv.COLOR_RGBA2RGB, 0);
    let dictionary = new cv.aruco_Dictionary(cv.DICT_6X6_250);
    let markerCorners = new cv.MatVector();
    let markerIds = new cv.Mat();
    cv.detectMarkers(this.dst, dictionary, markerCorners, markerIds);
    if (markerIds.rows === 0) {
      //Nothing detected
      return;
    }
    let response = {}; //id -> {rvec: [], tvec: []}

    cv.drawDetectedMarkers(this.dst, markerCorners, markerIds);
    let rvecs = new cv.Mat();
    let tvecs = new cv.Mat();
    let markerSize = 0.1
    cv.estimatePoseSingleMarkers(
      markerCorners,
      markerSize,
      cameraMatrix,
      distCoeffs,
      rvecs,
      tvecs
    );
    // console.log(markerIds);
    // console.log(markerCorners);


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
      // console.log("tvecs");
      // console.log(tvecs);
      // console.log("tvec")
      // console.log(tvec);
      // console.log("markerCorners");
      // console.log(markerCorners.get(i));
      
      // let markerCorner = cv.matFromArray(4, 1, cv.CV_64F, [
      //   markerCorners.get(i)[0],
      //   markerCorners.get(i)[1],
      //   markerCorners.get(i)[2],
      //   markerCorners.get(i)[3],
      // ]);
      // console.log("markerCorner");
      // console.log(markerCorner);
      cv.drawFrameAxes(this.dst, this.cameraMatrix, this.distCoeffs, rvec, tvec, 0.1);

      //   cv.drawAxis(this.dst, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
      let marker_id = markerIds.data[4 * i]; //ßTODO: FIgure out a way this can generalize for bigger ids
      response[marker_id] = { rvec, tvec, corners: markerCorners.get(i)};
      // console.log(markerCorners.get(i))
    //   // rvec.delete();
    //   // tvec.delete();
    }
    // if (response[1] && response[12]) {
    //   console.log(response[1]["tvec"]);
    //   console.log(response[12]["tvec"]);

    //   console.log(diff(response[1]["tvec"].data64F, response[12]["tvec"].data64F));
    // }
    return response;
  }
}

/**
 * Green: first coordinate
 * Blue: second coordinate
 */
