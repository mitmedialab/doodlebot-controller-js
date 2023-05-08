function diff(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}
let BORDER_IDS = {
  BOTTOM_LEFT: 31, //bottom left
  BOTTOM_RIGHT: 32, // bottom righ
  TOP_RIGHT: 33, //top right
  TOP_LEFT: 34, //top left
};

const APPEAR_THRESHOLD = 0.01;

class CameraController {
  constructor(
    cameraMatrix,
    distCoeffs,
    cameraHeight,
    cameraWidth,
    cameraConstraints,
    log,
    numFrames,
    is_own_camera
  ) {
    console.log("start");
    console.log(cameraMatrix);
    console.log(distCoeffs);
    console.log(cameraHeight);
    console.log(cameraWidth);
    console.log(cameraConstraints);
    console.log("yay!");
    this.cameraMatrix = cameraMatrix;
    this.distCoeffs = distCoeffs;
    this.isCameraActive = false;
    this.cameraHeight = cameraHeight;
    this.cameraWidth = cameraWidth;
    this.cameraConstraints = cameraConstraints;
    this.stream = null;
    this.log = log;
    this.is_own_camera = is_own_camera;

    this.rows = rows;
    this.cols = cols;
    this.cell_size = cell_size;

    this.src = new cv.Mat(cameraHeight, cameraWidth, cv.CV_8UC4); //original camera frame
    this.debug = new cv.Mat(cameraHeight, cameraWidth, cv.CV_8UC1); // original frame + aruco detection
    this.dst = new cv.Mat(cameraHeight, cameraWidth, cv.CV_8UC1); // Only the grid (2D flattened) shown in the UI

    // Below information related to the Aruco Codes
    this.currentVectors = {}; ///id -> {rvec: , tvec: }. id is the aruco id
    this.homographicMatrix = null;
    this.colorInfo = {}; //color -> [x, y, w, h]

    //To keep track of all the detection, and whether they appear in the board
    let MARKERS_INFO = {};
    for (let marker_id in OBJECT_SIZES) {
      MARKERS_INFO[marker_id] = {};
    }
    for (let color in COLOR_SIZES) {
      let { id } = COLOR_SIZES[color];
      MARKERS_INFO[id] = {};
    }

    this.appear_info = MARKERS_INFO;
    this.numFrames = numFrames;
  }
  async activateCamera() {
    this.isCameraActive = true;
  }
  deactivateCamera() {
    this.isCameraActive = false;
  }
  setupFrame(imageData) {
    this.src.data.set(imageData.data);
  }
  reduceGridOpacty() {
    // let alpha = 0.5;
    // let zeros = new cv.Mat(this.dst.rows, this.dst.cols, this.dst.type());
    // cv.addWeighted(this.dst, 1 - alpha, zeros, alpha, 0, this.dst);
  }
  filterColor(imageData, low, high) {
    // let mask = new cv.Mat();
    // let low_mat = cv.matFromArray(3, 1, cv.CV_64F, low);
    // let high_mat = cv.matFromArray(3, 1, cv.CV_64F, high);

    // this.src.data.set(imageData.data);

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

    let hsvMin = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), hsvMinArray);
    let hsvMax = new cv.Mat(hsv.rows, hsv.cols, hsv.type(), hsvMaxArray);

    // Threshold the image to extract yellow objects
    let mask = new cv.Mat();
    cv.inRange(hsv, hsvMin, hsvMax, mask);
    // cv.imshow("arucoCanvasOutputGrid", mask);
    // return;
    let morphKernel = cv.getStructuringElement(
      cv.MORPH_ELLIPSE,
      new cv.Size(5, 5)
    );
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
    cv.findContours(
      mask,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );
    let maxRect = null;
    for (let i = 0; i < contours.size(); i++) {
      rect = cv.boundingRect(contours.get(i));
      let [x, y, w, h] = [rect.x, rect.y, rect.width, rect.height];
      if (maxRect === null || maxRect[2] + maxRect[3] < w + h) {
        maxRect = [x, y, w, h];
      }
      // cv.rectangle(this.src, rect, new cv.Scalar(0, 255, 0), 2);
    }
    if (maxRect) {
      let [x, y, w, h] = maxRect;
      cv.rectangle(
        this.debug,
        new cv.Point(x, y),
        new cv.Point(x + w, y + h),
        [255, 0, 0, 255],
        2
      );
      // console.log(`Center = ${x+w/2}, ${y+h/2}`);
    }
    // cv.imshow("arucoCanvasOutputGrid", this.src);

    // Free memory
    // src.delete();
    hsvMin.delete();
    hsvMax.delete();
    hsv.delete();
    mask.delete();
    contours.delete();
    hierarchy.delete();
    morphKernel.delete();

    if (maxRect) {
      this.colorInfo.PINK = maxRect;
      return { PINK: maxRect };
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
    (high = cv.Scalar(30, 255, 255, 255)),
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
    //   let src = new cv.Mat(cameraHeight, cameraWidth, cv.CV_8UC4);
    //   let dst = new cv.Mat(cameraHeight, cameraWidth, cv.CV_8UC1);

    // this.src.data.set(imageData.data);

    cv.cvtColor(this.src, this.debug, cv.COLOR_RGBA2RGB, 0);
    let dictionary = new cv.aruco_Dictionary(cv.DICT_6X6_250); //TODO: Try 4x4, april tags dictionary
    let markerCorners = new cv.MatVector();
    let markerIds = new cv.Mat();
    cv.detectMarkers(this.debug, dictionary, markerCorners, markerIds);
    if (markerIds.rows === 0) {
      //Nothing detected
      return {};
    }
    let response = {}; //id -> {rvec: [], tvec: []}

    cv.drawDetectedMarkers(this.debug, markerCorners, markerIds);
    let rvecs = new cv.Mat();
    let tvecs = new cv.Mat();
    let markerSize = 0.1;
    cv.estimatePoseSingleMarkers(
      markerCorners,
      markerSize,
      this.cameraMatrix,
      this.distCoeffs,
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
      cv.drawFrameAxes(
        this.debug,
        this.cameraMatrix,
        this.distCoeffs,
        rvec,
        tvec,
        0.1
      );

      //   cv.drawAxis(this.dst, cameraMatrix, distCoeffs, rvec, tvec, 0.1);
      let marker_id = markerIds.data[4 * i]; //ßTODO: FIgure out a way this can generalize for bigger ids
      response[marker_id] = { rvec, tvec, corners: markerCorners.get(i) };
      this.currentVectors[Number(marker_id)] = response[marker_id]; //Saving for future use
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
  /**
   * @returns true iff all the corners defined in BORDER_IDS have been detected by Aruco
   */
  foundAllCorners() {
    for (let key in BORDER_IDS) {
      if (!this.currentVectors[BORDER_IDS[key]]) {
        return false;
      }
    }
    return true;
  }
  foundProjectionMatrix() {
    return this.homographicMatrix != null;
  }
  /**
   *
   * @param {*} point 3d point, usually from a tvec.data64F
   * @returns
   */
  get2D(point) {
    let rvec = cv.matFromArray(3, 1, cv.CV_64F, [0, 0, 0]);
    let tvec = cv.matFromArray(3, 1, cv.CV_64F, [0, 0, 0]);
    let out = new cv.Mat();
    let pt = cv.matFromArray(3, 1, cv.CV_64F, point);
    cv.projectPoints(pt, rvec, tvec, this.cameraMatrix, this.distCoeffs, out);
    let res = out.data64F;
    return res;
  }
  /**
   * Finds the projection matrix to go from the camera frame to the 2D grid
   * @returns
   */
  findProjectionMatrix() {
    console.log("Finding homographic matrix");
    if (
      !this.currentVectors[BORDER_IDS.BOTTOM_LEFT] ||
      !this.currentVectors[BORDER_IDS.BOTTOM_RIGHT] ||
      !this.currentVectors[BORDER_IDS.TOP_RIGHT] ||
      !this.currentVectors[BORDER_IDS.TOP_LEFT]
    ) {
      console.log("Not 4 corners have been found yet");
      return;
    }
    //TODO: Figure out why bottom left and top left, and bottom right and top right are flipped!
    let bl = this.get2D(
      this.currentVectors[BORDER_IDS.BOTTOM_LEFT].tvec.data64F
    );
    let br = this.get2D(
      this.currentVectors[BORDER_IDS.BOTTOM_RIGHT].tvec.data64F
    );

    let tl = this.get2D(this.currentVectors[BORDER_IDS.TOP_LEFT].tvec.data64F);
    let tr = this.get2D(this.currentVectors[BORDER_IDS.TOP_RIGHT].tvec.data64F);

    console.log(`Bottom left = ${bl}`);
    console.log(`Bottom right = ${br}`);
    console.log(`Top left: ${tl}`);
    console.log(`Top right: ${tr}`);

    let srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      bl[0],
      bl[1],
      br[0],
      br[1],
      tl[0],
      tl[1],
      tr[0],
      tr[1],
    ]);
    let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0,
      0,
      cameraWidth,
      0,
      0,
      cameraHeight,
      cameraWidth,
      cameraHeight,
    ]);
    this.homographicMatrix = cv.getPerspectiveTransform(srcTri, dstTri); //, dstTri); //cv.findHomography(srcTri, dstTri);

    //   srcTri.remove();
    //   dstTri.remove();
  }
  /**
   * Projects the frame into a "flat" 2d version and saves it on this.dst
   */
  projectFrameToGrid() {
    if (!this.foundProjectionMatrix()) {
      this.log("Cannot do until homographicMatrix is defined");
      return;
    }
    if (!this.src || !this.src.data) {
      this.log("Src canvas not ready..");
      return;
    }
    try {
      // let dsize = new cv.Size(width, height);
      let dsize = new cv.Size(this.src.cols, this.src.rows);
      let scalarProjection = new cv.Scalar();
      cv.warpPerspective(
        this.src,
        this.dst, // canvasProjectionOut //new cv.Mat(cameraHeight, cameraWidth, cv.CV_8UC4);
        this.homographicMatrix,
        dsize,
        cv.INTER_LINEAR,
        cv.BORDER_CONSTANT,
        scalarProjection
      );
      return;
    } catch (e) {
      this.log("[show2dProjection] Uh oh..there was an error:");
      this.log(e);
      return;
    }
  }
  /**
   * Draws horizontal and vertical lines in the 2D projection, representing the grid
   */
  drawGridLines() {
    let color = [0, 0, 255, 128];
    let thickness = 1;
    let p1;
    let p2;
    //Draw vertical lines
    for (let i = 0; i <= cols; i += 1) {
      let x_1 = Math.floor(((cameraWidth - 1) / this.cols) * i);
      let y_1 = 0;
      let x_2 = Math.floor(((cameraWidth - 1) / this.cols) * i);
      let y_2 = cameraHeight - 1;
      p1 = new cv.Point(x_1, y_1);
      p2 = new cv.Point(x_2, y_2);
      cv.line(this.dst, p1, p2, color, thickness);
    }

    //For horizontal lines
    for (let i = 0; i <= rows; i += 1) {
      let x_1 = 0;
      let y_1 = Math.floor(((cameraHeight - 1) / this.rows) * i);
      let x_2 = cameraWidth - 1;
      let y_2 = Math.floor(((cameraHeight - 1) / this.rows) * i);
      p1 = new cv.Point(x_1, y_1);
      p2 = new cv.Point(x_2, y_2);
      cv.line(this.dst, p1, p2, color, thickness);
    }

    //   p1.delete();
    //   p2.delete();
  }
  /**
   *
   * @param {*} id aruco marker
   * @returns 2d position of the 3d coordinates (from tvec) of a given marker
   */
  getReal2dPosition(id_or_color, is_color = false) {
    let point; //2D point
    if (!is_color) {
      point = this.get2D(this.currentVectors[id_or_color].tvec.data64F);
    } else {
      point = this.colorInfo[id_or_color];
    }
    let point3D = cv.matFromArray(3, 1, cv.CV_64F, [point[0], point[1], 1]);
    let outPoint3D = new cv.Mat();
    let useless = new cv.Mat(); //to be multiplied by 0
    cv.gemm(this.homographicMatrix, point3D, 1, useless, 0, outPoint3D); //-rot^t * tvec
    let [tx, ty, t] = outPoint3D.data64F;
    let outPoint2D = [tx / t, ty / t];
    return outPoint2D;
  }
  /**
   * Transforms real [x, y] into [i, j] grid coordinates
   * @param {*} pos
   * @returns
   */
  getGridPositionFromReal(pos) {
    let [x, y] = pos;
    let [gridX, gridY] = [
      Math.floor((x / this.cameraWidth) * this.cols),
      Math.floor((y / this.cameraWidth) * this.rows),
    ];
    return [gridX, gridY];
  }
  /**
   *
   * @param {*} id aruco marker
   * @returns 2d position in the 2D grid of a given marker
   */
  getGridPosition(id_or_color, is_color = false) {
    let [x, y] = this.getReal2dPosition(id_or_color, is_color);
    return this.getGridPositionFromReal([x, y]);
  }
  /**
   *
   * @param {*} rvec
   * @returns  The 2d angle direction of the rotation vector, in the [0, 360) range
   */
  getRotation2DAngle(rvec) {
    let rot = new cv.Mat();
    cv.Rodrigues(rvec, rot);
    //TODO: Figure out if you only need to do the 2d projection of the direction
    let dir = rot.row(1).data64F; // * halfSide;
    let dir2D = this.get2D(dir);
    let angle = Math.atan2(dir2D[1], dir2D[0]);
    angle = (angle * 180) / Math.PI;
    if (angle < 0) {
      angle += 360;
    } //Make sure angle is on [0. 360)
    return angle;
  }
  /**
   *
   * @param {*} p1: [x1, y1]
   * @param {*} p2: [x2, y2]
   * @returns the angle of the vector that starts at p1 and ends at p2
   */
  getDirectionFrom(p1, p2) {
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    let dx = x2 - x1;
    let dy = y2 - y1;
    let angle = Math.atan2(dy, dx);
    angle = (angle * 180) / Math.PI;
    if (angle < 0) {
      angle += 360;
    } //Make sure angle is [0, 360), not [-180, 180)

    return angle;
  }
  /**
   *
   * @param {*} realAngle
   * @returns get angle from 0, 90, 180, 270 that is closest to realAngle
   * Might be broken, since angles calculated from camera are funky
   */
  getClosestAngle(realAngle) {
    //Adding the 360 so that if its > 300 then it detects as close to 0
    let possibilities = [...Object.values(ANGLE_DIRS), 360].sort(
      (a, b) => Math.abs(a - realAngle) - Math.abs(b - realAngle)
    );
    return possibilities[0] % 360; //the closest to realAngle
  }
  /**
   * Assumes `aruco_bot_id` is part of `this.currentVectors`
   *
   * returns {angle: , realAngle:} where angle is one of [0, 90, 180, 270] and realAngle is anything in [0, 360) range
   */
  getBotAngle(aruco_bot_id) {
    let { direction_id } = OBJECT_SIZES[aruco_bot_id];
    let realAngle;

    if (!this.currentVectors[direction_id]) {
      //If no direction, use the traditional way (somewhat broken sadly)
      realAngle = this.getRotation2DAngle(
        this.currentVectors[aruco_bot_id].rvec
      );
    } else {
      //Find angle from unit vector bot_id -> direction_id
      let [bot_x, bot_y] = this.getReal2dPosition(aruco_bot_id);
      let [dir_x, dir_y] = this.getReal2dPosition(direction_id);
      realAngle = this.getDirectionFrom([bot_x, bot_y], [dir_x, dir_y]);
    }

    let gridAngle = this.getClosestAngle(realAngle);
    return {
      angle: gridAngle,
      realAngle: realAngle,
    };
  }
  /**
   * This method is only valid for Obstacle or Coins, as with Bot the info
   * from aruco code is not necessarily the real_bottom_left
   *
   * @param {*} id aruco id
   * @returns {object} {width, height, real_bottom_left}, that either come form OBJECT_SIZES
   * or, if object has another corner detected, uses that info
   *
   */
  getObjectPositionInfo(id) {
    if (!(id in OBJECT_SIZES)) {
      console.log(`Couldnt find size information for id =${id} `);
      return {};
    }
    if (OBJECT_SIZES[id].type === BOT_TYPE) {
      console.log(
        `[getObjectPositionInfo] This method is not valid for Bots. `
      );
      return {};
    }
    let { other_corner_id, width, height } = OBJECT_SIZES[id];
    let [x1, y1] = this.getGridPosition(id);
    if (!other_corner_id || !this.currentVectors[other_corner_id]) {
      //If there is no set other corner, or it hasn't been detected
      return {
        width,
        height,
        real_bottom_left: [x1, y1],
      };
    } else {
      let [x2, y2] = this.getGridPosition(other_corner_id);
      let minX = Math.min(x1, x2);
      let maxX = Math.max(x1, x2);
      let minY = Math.min(y1, y2);
      let maxY = Math.max(y1, y2);
      return {
        width: maxX - minX + 1,
        height: maxY - minY + 1,
        real_bottom_left: [minX, minY],
      };
    }
  }
  /**
   * update marker_id's "appear" array of 1s and 0s. It makes sure the length is up to numFrames
   * @param {*} marker_id aruco marker
   * @param {*} appeared 1 if marker was detected, 0 otherwise
   */
  updateMarkerAppear(marker_id, appeared) {
    let appear = this.appear_info[marker_id].appear;
    if (!appear) {
      appear = [];
    }
    appear.push(appeared);
    if (appear.length > this.numFrames) {
      //Need to delete oldest entry
      appear = appear.slice(1, appear.length);
    }
    this.appear_info[marker_id].appear = appear;
  }

  /**
   *
   * @param {*} marker_id aruco marker
   * @returns true iff the given marker is considered to be in the board, according to APPEAR_THRESHOLD
   */
  isInBoard(marker_id) {
    if (!(marker_id in this.appear_info)) {
      return false;
    }
    let appear = this.appear_info[marker_id].appear;
    if (!appear) {
      return false;
    }
    let timesDetected = appear.reduce((a, b) => a + b, 0);
    let avg = timesDetected / appear.length;
    return avg > APPEAR_THRESHOLD;
  }
}

/**
 * Green: first coordinate
 * Blue: second coordinate
 */
export { CameraController };
