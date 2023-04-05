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
  filterColor(imageData, low, high){
    console.log("filtering")

  
    // let mask = new cv.Mat();
    // let low_mat = cv.matFromArray(3, 1, cv.CV_64F, low);
    // let high_mat = cv.matFromArray(3, 1, cv.CV_64F, high);
    this.src.data.set(imageData.data);
    // cv.cvtColor(this.src, this.dst, cv.COLOR_BGR2HSV);
    // cv.cvtColor(this.dst, this.dst, cv.COLOR_BGR2GRAY);

    // this.src = cv.imread(arucoCanvasOutput);
      // Convert the image to HSV color space
  let hsv = new cv.Mat();
  cv.cvtColor(this.src, hsv, cv.COLOR_RGBA2RGB);
  cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);
    //  let   hsvMin = new cv.Scalar(20, 100, 100);
    // let hsvMax = new cv.Scalar(30, 255, 255);
    // let lowScalar = new cv.Scalar(30, 30, 0);
// let highScalar = new cv.Scalar(180, 180, 180);
  // let  hsvMin = new cv.Mat(this.src.rows, this.src.cols, this.src.type(), lowScalar);
  //  let  hsvMax = new cv.Mat(this.src.rows, this.src.cols, this.src.type(), highScalar);
  //  let  hsvMin = new cv.Mat(this.src.rows, this.src.cols, cv.CV_8UC4, [20, 100, 100, 0]);
  //  let  hsvMax = new cv.Mat(this.src.rows, this.src.cols, cv.CV_8UC4, [30, 255, 255, 0]);
  // YELLOW
  // let hsvMinArray = [20, 100, 100, 0];
  // let hsvMaxArray = [30, 255, 255, 0];
  //BLUE
  // let hsvMinArray = [60, 35, 140, 0];
  // let hsvMaxArray = [180, 255, 255, 0];
  //PINK
  let hsvMinArray = [160, 100, 20, 0];
  let hsvMaxArray = [179, 255, 255, 0];

  //PINK
  // let hsvMinArray = [0, 100, 20, 0];
  // let hsvMaxArray = [180, 255, 255, 0];

   let  hsvMin = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), hsvMinArray);
   let  hsvMax = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), hsvMaxArray);

  // Threshold the image to extract yellow objects
  let mask = new cv.Mat();
  cv.inRange(hsv, hsvMin, hsvMax, mask);
  cv.imshow('arucoCanvasOutput', mask)
  // return;
  let morphKernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
  cv.morphologyEx(mask, mask, cv.MORPH_OPEN, morphKernel);
  // let kernel = cv.Mat.ones(5, 5, cv.CV_8U);
  // let anchor = new cv.Point(-1, -1);

  // // cv.erode(mask, mask, kernel, anchor, 1)
  // // cv.dilate(mask, mask, kernel, anchor, 1)

  // cv.morphologyEx(mask, mask, cv.MORPH_OPEN, kernel, anchor, 1,
  //               cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
    // cv.imshow("arucoCanvasOutput", mask)
// return;
  // Find contours in the mask
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  let rect;
  cv.findContours(mask, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  let maxRect = null
  for (let i = 0; i < contours.size(); i++) {
    rect = cv.boundingRect(contours.get(i));
    let [x, y, w, h] = [rect.x, rect.y, rect.width, rect.height];
    if (maxRect === null || maxRect[2]+maxRect[3] < w + h){
      maxRect = [x, y, w, h];
    }
    // cv.rectangle(this.src, rect, new cv.Scalar(0, 255, 0), 2);

  }
  if (maxRect){
    let [x, y, w, h] = maxRect;
    cv.rectangle(this.dst, new cv.Point(x, y), new cv.Point(x+w, y+h), [255, 0, 0, 255], 2);
    // console.log(`Center = ${x+w/2}, ${y+h/2}`);
  }
  cv.imshow("arucoCanvasOutput", this.src)


    // Free memory
  // src.delete();
  hsvMin.delete();
  hsvMax.delete();
  hsv.delete();
  mask.delete();
  contours.delete();
  hierarchy.delete();
  morphKernel.delete();
  
  if (maxRect){
    return {PINK: maxRect};
  } else {
    return {};
  }
  // this.dst = hsv;

    // let low_mat = new cv.Mat(4, 1, cv.CV_64F, [20, 100, 100, 0]);
    // let high_mat = new cv.Mat(4, 1, cv.CV_64F, [30, 255, 255, 255]);

    // low = new cv.Mat(this.dst.rows, this.dst.cols, this.dst.type(), [20, 100, 100, 0]);
    // high = new cv.Mat(this.dst.rows, this.dst.cols, this.dst.type(), [30, 255, 255, 255]);
    // low = new cv.Mat(this.dst.rows, this.dst.cols, this.dst.type(), [0,0,0, 0]);
    // high = new cv.Mat(this.dst.rows, this.dst.cols, this.dst.type(), [150, 150, 150, 255]);
    // let low
    low = cv.Scalar(20, 100, 100, 0);
    high = cv.Scalar(30, 255, 255, 255),

    cv.inRange(this.dst, low, high, this.dst);
    // cv.bitwise_and(this.dst, this.dst, this.dst, mask);

    // cv.cvtColor(this.dst, this.dst, cv.COLOR_HSV2BGR);

    // this.dst = out;
    // console.log(this.dst);
    // return out;
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
    let dictionary = new cv.aruco_Dictionary(cv.DICT_6X6_250); //TODO: Try 4x4, april tags dictionary
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
