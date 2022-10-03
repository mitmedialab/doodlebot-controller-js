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
  if (markerIds.rows > 0) {
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
    // for (let i = 0; i < markerIds.rows; i++) {
    //   cv.drawFrameAxes(
    //     dst,
    //     cameraMatrix,
    //     distCoeffs,
    //     rvecs[i],
    //     tvecs[i],
    //     0.1
    //   );
    // }
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
      rvec.delete();
      tvec.delete();
    }
  }

  return markerIds;
}
