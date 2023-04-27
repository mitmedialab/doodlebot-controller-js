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
import { get_socket } from "./virtual-board/test-index.js";

let currentVectors = {}; //id -> {rvec: , tvec: }. id is the aruco id
let cameraController;
let videoObj = document.getElementById("videoId");
let socket;
document.addEventListener("DOMContentLoaded", () => {
  socket = get_socket();
});

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
    window.cameraWidth = cameraWidth;
    window.cameraHeight = cameraHeight;

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
    let dsize = new cv.Size(width, height); //new cv.Size(cameraController.src.cols, cameraController.src.rows);
    cv.warpPerspective(
      cameraController.src,
      canvasProjectionOut,
      homographicMatrix,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      scalarProjection
    );
    drawGrid();
    cv.imshow("arucoCanvasOutputGrid", canvasProjectionOut); // canvasOutput is the id of another <canvas>;
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
function processVideo() {
  if (!cameraController.isCameraActive) {
    return;
  }
  let begin = Date.now();
  context.drawImage(videoObj, 0, 0, cameraWidth, cameraHeight);
  socket.emit("stream", arucoCanvasOutputGrid.toDataURL("image/webp"));

  let imageData = context.getImageData(0, 0, cameraWidth, cameraHeight);
  let markersInfo = cameraController.findArucoCodes(imageData);
  let currentColors = cameraController.filterColor(
    imageData,
    [0, 0, 0],
    [0, 0, 255]
  );
  canvasProjectionOut = cameraController.src;
  if (context) {
    // cv.imshow("arucoCanvasOutputGrid", cameraController.dst); // canvasOutput is the id of another <canvas>;
    // show2dProjection(); //Show image
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
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
  return markersInfo;
}
