/**
 * In this file there are the methods for the physical version of the Doodlebot UI.
 *
 * Most important methods are to:
 *  1) Handle Bluetooth connections with the Doodlebots.
 *  2) Handle connecting to the physical camera.
 */
//--------------------------------Logging stuff------------------------------------------------//

function log(message) {
  logBox.value = message + "\n" + logBox.value;
}

//-------------------------------Bluetooth handlers-----------------------------------------------//

import { Doodlebot } from "./doodlebot_control/doodlebot.js";

let currentDoodlebot; //Current Doodlebot object that has been connected to the device through Bluetooth
let allDoodlebots = {}; // Doodlebot name -> doodlebot object for control the REAl doodlebots

async function onRequestBluetoothDeviceButtonClick() {
  try {
    let newDoodlebot = new Doodlebot(log);
    await newDoodlebot.request_device();
    //TODO: Make sure it's okay not having `populateBluetoothDevices` method is fine
    log("Trying to connect...");
    await newDoodlebot.connect();
    let { id, name } = newDoodlebot.bot;
    currentDoodlebot = newDoodlebot;
    console.log(`Added id with ${id} and name ${name}`);
    log(`Added id with ${id} and name ${name}`);
    bluetooth_button.innerText = `Connected to ${name}!`;

    // allDoodlebots[newDoodlebot.bot.id] = newDoodlebot; // Saving object
    allDoodlebots[name] = newDoodlebot; // This might not be necessary as it'll be 1 per laptop

    //TODO: Make sure you can only connect to one device at a time
    const devicesSelect = document.querySelector("#devicesSelect");
    const option = document.createElement("option");
    option.value = newDoodlebot.bot.id;
    option.textContent = newDoodlebot.bot.name;
    devicesSelect.appendChild(option);
  } catch (error) {
    log("Problem connecting to Bluetooth: " + error);
  }
}

bluetooth_button.addEventListener("click", async (evt) => {
  await onRequestBluetoothDeviceButtonClick();
});
//-------------------------------Camera handlers-----------------------------------------------//
import { CameraController } from "./marker_detector/camera-controller.js";
import {
  cameraMatrix,
  distCoeffs,
  cameraConstraints,
  FPS,
} from "./marker_detector/constants.js";

let currentVectors = {}; //id -> {rvec: , tvec: }. id is the aruco id
window.currentVectors = currentVectors;
let cameraController;
let videoObj = document.getElementById("videoId");
// document.addEventListener("DOMContentLoaded", () => {

// })

let cameraWidth;
let cameraHeight;
let context = arucoCanvasOutputGrid.getContext("2d", {
  willReadFrequently: true,
});

//OpenCv variables
let homographicMatrix; // to transform camera stream into a "flat" 2D frame
let canvasProjectionOut; //Opencv matrix to store projection of 2d - needs to be global variable because otherwise opencv complains after a few seconds
let scalarProjection; //unclear if needed
//To be used in the drawObjectOnCanvas method
let bottom_left;
let bottom_right;
let top_left;
let top_right;

let BORDER_IDS = {
  BOTTOM_LEFT: 31, //bottom left
  BOTTOM_RIGHT: 32, // bottom righ
  TOP_RIGHT: 33, //top right
  TOP_LEFT: 34, //top left
};
let colorInfo = {}; //color -> [x, y, w, h]
let DOODLEBOT_ID_TO_ARUCO_ID = {
  "Doodlebot Samba\r\n": 1,
  "Doodlebot Banksy": 2,
  // "Doodlebot Bluefruit52": 2,
};
/*
  Mapping between doodlebot BLE ids to aruco ids
  This allows the connection between physical bots and virtual bots
*/
let ARUCO_ID_TO_DOODLEBOT_ID = {
  // 1: "Xcuis/UrHNMN+oXjCB5Ldg==",
  // 1: "90pOM2ntPK3x6YVsJD0UBA==",
  // 2: "rNmwnlbopAuiAnTpSxnPRw=="
  1: "Doodlebot Samba\r\n",
  2: "Doodlebot Banksy",
  // 2: "Doodlebot Bluefruit52",
};

// Number of frames to check to figure out whether a marker is still on the board
let numFrames = 20;
//TODO: Maybe bettter to use ALL_ASSETS ?
const OBJECT_SIZES = {
  //bots
  //6, 4, 2, 1
  1: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 51,
  },
  2: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 52,
  },
  3: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 53,
  },
  4: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 54,
  },
  5: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 55,
  }, //TODO: Put back when obstacle's other_corner is set to another id
  // obstacles
  11: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 61 },
  12: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 62 },
  13: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 63 },
  14: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 64 },
  15: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 65 },
  // coins
  21: { type: COIN_TYPE, width: 1, height: 1 },
  22: { type: COIN_TYPE, width: 1, height: 1 },
  23: { type: COIN_TYPE, width: 1, height: 1 },
  24: { type: COIN_TYPE, width: 1, height: 1 },
  25: { type: COIN_TYPE, width: 1, height: 1 },
};
const COLOR_SIZES = {
  PINK: { id: 26, type: COIN_TYPE, width: 3, height: 3 },
};
let MARKERS_INFO = {};
for (let marker_id in OBJECT_SIZES) {
  MARKERS_INFO[marker_id] = {};
}
for (let color in COLOR_SIZES) {
  let { id } = COLOR_SIZES[color];
  MARKERS_INFO[id] = {};
}

/**
 * Camera controllers
 */
if (typeof cv !== "undefined") {
  onReady();
} else {
  document.getElementById("opencvjs").addEventListener("load", onReady);
}

async function onReady() {
  console.log("Opencv is ready!");
  cv = await cv;

  canvasProjectionOut = new cv.Mat();
  scalarProjection = new cv.Scalar();

  activate_camera.disabled = false;
}

activate_camera.addEventListener("change", async (evt) => {
  let activate = evt.target.checked;
  if (activate) {
    cameraWidth = cell_size * cols;
    cameraHeight = cell_size * rows;
    videoObj.setAttribute("width", cameraWidth);
    videoObj.setAttribute("height", cameraHeight);
    cameraController = new CameraController(
      cameraMatrix,
      distCoeffs,
      cameraHeight,
      cameraWidth,
      { ...cameraConstraints, width: cameraWidth, height: cameraHeight }
    );
    let stream = await cameraController.activateCamera();
    videoObj.srcObject = stream;
    // //create grid
    // currentBotId = 1; //TODO: For now hardcode, later change
    processVideo();
  } else {
    console.log("Deactivating camera");
    cameraController.deactivateCamera();
    videoObj.srcObject = null;
  }
});
/**
 * Projects the frame into a "flat" 2d version, adds grid lines and shows it in the canvas
 */
function show2dProjection() {
  if (!homographicMatrix) {
    log("Cannot do until homographicMatrix is defined");
    return;
  }
  if (!cameraController.src || !cameraController.src.data) {
    log("Src canvas not ready..");
    return;
  }
  try {
    // let dsize = new cv.Size(width, height);
    let dsize = new cv.Size(
      cameraController.src.cols,
      cameraController.src.rows
    );
    cv.warpPerspective(
      cameraController.src,
      canvasProjectionOut,
      homographicMatrix,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      scalarProjection
    );
    // cv.imshow("arucoCanvasOutputGrid", canvasProjectionOut); // canvasOutput is the id of another <canvas>;
    // dsize.release();
    return;
  } catch (e) {
    log("[show2dProjection] Uh oh..there was an error:");
    log(e);
    return;
  }
}
function drawGridLines() {
  let color = [0, 0, 255, 128];
  let thickness = 1;
  let p1;
  let p2;
  //Draw vertical lines
  for (let i = 0; i <= cols; i += 1) {
    let x_1 = Math.floor(((cameraWidth - 1) / cols) * i);
    let y_1 = 0;
    let x_2 = Math.floor(((cameraWidth - 1) / cols) * i);
    let y_2 = cameraHeight - 1;
    p1 = new cv.Point(x_1, y_1);
    p2 = new cv.Point(x_2, y_2);
    cv.line(canvasProjectionOut, p1, p2, color, thickness);
  }

  //For horizontal lines
  for (let i = 0; i <= rows; i += 1) {
    let x_1 = 0;
    let y_1 = Math.floor(((cameraHeight - 1) / rows) * i);
    let x_2 = cameraWidth - 1;
    let y_2 = Math.floor(((cameraHeight - 1) / rows) * i);
    p1 = new cv.Point(x_1, y_1);
    p2 = new cv.Point(x_2, y_2);
    cv.line(canvasProjectionOut, p1, p2, color, thickness);
  }

  //   p1.delete();
  //   p2.delete();
}
/**
 * @returns true iff all the corners defined in BORDER_IDS have been detected by Aruco
 */
function allCornersFound() {
  for (let key in BORDER_IDS) {
    if (!currentVectors[BORDER_IDS[key]]) {
      return false;
    }
  }
  return true;
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
  let res = out.data64F;
  return res;
}
function findHomographicMatrix() {
  console.log("Finding homographic matrix");
  let worldx = cell_size * cols; //640; //3;
  let worldy = cell_size * rows; //640; //2;
  if (
    !currentVectors[BORDER_IDS.BOTTOM_LEFT] ||
    !currentVectors[BORDER_IDS.BOTTOM_RIGHT] ||
    !currentVectors[BORDER_IDS.TOP_RIGHT] ||
    !currentVectors[BORDER_IDS.TOP_LEFT]
  ) {
    console.log("Not 4 corners have been found yet");
    return;
  }
  //TODO: Figure out why bottom left and top left, and bottom right and top right are flipped!
  let bl = get2D(currentVectors[BORDER_IDS.BOTTOM_LEFT].tvec.data64F);
  let br = get2D(currentVectors[BORDER_IDS.BOTTOM_RIGHT].tvec.data64F);

  let tl = get2D(currentVectors[BORDER_IDS.TOP_LEFT].tvec.data64F);
  let tr = get2D(currentVectors[BORDER_IDS.TOP_RIGHT].tvec.data64F);

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
    worldx,
    0,
    0,
    worldy,
    worldx,
    worldy,
  ]);
  homographicMatrix = cv.getPerspectiveTransform(srcTri, dstTri); //, dstTri); //cv.findHomography(srcTri, dstTri);

  //   srcTri.remove();
  //   dstTri.remove();
}
function processVideo() {
  if (!cameraController.isCameraActive) {
    return;
  }
  let begin = Date.now();
  context.drawImage(videoObj, 0, 0, cameraWidth, cameraHeight);
  let imageData = context.getImageData(0, 0, cameraWidth, cameraHeight);
  let markersInfo = cameraController.findArucoCodes(imageData);
  let currentColors = cameraController.filterColor(
    imageData,
    [0, 0, 0],
    [0, 0, 255]
  );
  canvasProjectionOut = cameraController.src;
  if (context) {
    if (!markersInfo) {
      console.log("No markers detected");
    } else {
      if (allCornersFound() && !homographicMatrix) {
        findHomographicMatrix();
      }
      for (let marker_id in markersInfo) {
        marker_id = Number(marker_id);
        // foundArucoIds.add(marker_id);
        currentVectors[marker_id] = markersInfo[marker_id];
      }
      for (let color in currentColors) {
        colorInfo[color] = currentColors[color]; //Storing [x, y, w, h]
      }
      //   cv.imshow("arucoCanvasOutputGrid", cameraController.dst); // canvasOutput is the id of another <canvas>;
      show2dProjection(); //Show image
      let hide_grid = arucoCanvasOutputGrid.hasAttribute("hide-grid");
      if (!hide_grid) {
        drawGridLines(); //Show lines
      }
      // drawGridObjectsOnCanvas(); //Show objects

      //TODO: Figure out why is this necessary, maybe because the camera coefficients
      //TODO 2: Maybe create a copy before moving
      cv.flip(canvasProjectionOut, canvasProjectionOut, 0);
      cv.imshow("arucoCanvasOutputGrid", canvasProjectionOut); // canvasOutput is the id of another <canvas>;
    }
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}

updateCornersButton.addEventListener("click", findHomographicMatrix);
