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
let cameraWidth;
let cameraHeight;
let context = arucoCanvasOutputGrid.getContext("2d", {
  willReadFrequently: true,
});

//OpenCv variables

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
    images: {
      None: "doodlebot_alone",
    },
  },
  2: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 52,
    images: {
      None: "doodlebot_cowboy",
    },
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
  11: {
    type: OBSTACLE_TYPE,
    width: 1,
    height: 1,
    other_corner_id: 61,
    images: {
      None: "building",
    },
  },
  12: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 62 },
  13: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 63 },
  14: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 64 },
  15: { type: OBSTACLE_TYPE, width: 1, height: 1, other_corner_id: 65 },
  // coins
  21: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    images: {
      None: "coin",
    },
  },
  22: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    images: {
      None: "coin",
    },
  },
  23: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    images: {
      None: "coin",
    },
  },
  24: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    images: {
      None: "coin",
    },
  },
  25: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    images: {
      None: "coin",
    },
  },
};
const COLOR_SIZES = {
  PINK: {
    id: 26,
    type: COIN_TYPE,
    width: 3,
    height: 3,
    images: {
      None: "coin",
    },
  },
};
window.OBJECT_SIZES = OBJECT_SIZES;
window.COLOR_SIZES = COLOR_SIZES;

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
      { ...cameraConstraints, width: cameraWidth },
      log,
      numFrames // to detect dissapeared frames
    );
    let stream = await cameraController.activateCamera();
    videoObj.srcObject = stream;
    //create grid
    // currentBotId = 1; //TODO: For now hardcode, later change
    processVideo();
  } else {
    console.log("Deactivating camera");
    cameraController.deactivateCamera();
    videoObj.srcObject = null;
  }
});
/**
 *
 * @param {*} id aruco marker
 * @returns BOT_TYPE, OBSTACLE_TYPE or COIN_TYPE, accordingly
 */
function getTypeObject(id) {
  if (!(id in OBJECT_SIZES)) {
    return null; //not object we care about
  }
  return OBJECT_SIZES[id].type;
}
const getAssetImages = (aruco_id, is_color = false) => {
  let info = is_color ? COLOR_SIZES : OBJECT_SIZES;

  if (!(aruco_id in info)) {
    console.log(`Invalid ${aruco_id}: not in OBJECT_SIZES`);
    return {};
  }
  if (!info[aruco_id].images) {
    console.log(`Invalid ${aruco_id}: no images`);
    return {};
  }
  if (!info[aruco_id].images[selectedOption]) {
    console.log(`Invalid ${aruco_id}: no images.${selectedOption}`);
    return {};
  }
  return ALL_ASSETS[info[aruco_id].images[selectedOption]];
};
/**
 * Updates position of a given bot in the virtual grid. If the bot is not there then it
 * will create one
 * @param {*} id aruco marker
 */
function updateVirtualBot(id) {
  let [gridX, gridY] = cameraController.getGridPosition(id);
  let { angle, realAngle } = cameraController.getBotAngle(id);

  if (!(id in OBJECT_SIZES)) {
    console.log(`Couldnt find size information for id = ${id} `);
  }
  let { relative_anchor, width, height } = OBJECT_SIZES[id];

  let { image, image_rotate_90 } = getAssetImages(id);

  let [anchor_x, anchor_y] = relative_anchor;
  //If its not there, create one
  if (!grid.bots[id]) {
    //virtual bot doesnt exist, so create one
    let bot_to_add = {
      id: id,
      real_bottom_left: [-anchor_x, -anchor_y], //So that real anchor = [0, 0] //TODO: make real_bottom_left correct
      angle: 0,
      relative_anchor: [anchor_x, anchor_y], //wont change
      width: width, //wont change
      height: height, //wont change
      image,
      image_rotate_90,
    };
    //This assumes angle is 0, need to turn it if necessary
    bot_to_add = grid.future_position_after_turn(bot_to_add, angle);

    //This was assuming that real_anchor = [0, 0], so now need to move it to [gridX, gridY] (where the aruco code is)
    bot_to_add.real_bottom_left = [
      bot_to_add.real_bottom_left[0] + gridX,
      bot_to_add.real_bottom_left[1] + gridY,
    ];
    bot_to_add.realAngle = realAngle;

    let { bot, success, message } = grid.add_bot(bot_to_add);
    if (!success) {
      console.log(`Couldn't add bot ${id}: ${message}`);
    } else {
      //   socket.emit("add_bot", { bot, virtualGrid: grid.toJSON() });
    }
  } else {
    //If it already exists, just update accordingly
    let update = {
      angle: angle,
      realAngle: realAngle,
      real_anchor: [gridX, gridY],
    };
    let { success, message } = grid.update_bot(id, update);
    if (!success) {
      console.log(`Couldn't update bot ${id}: ${message}`);
    } else {
      //   socket.emit("update_bot", { id, update, virtualGrid: grid.toJSON() });
    }
  }
}
/**
 * Updates position of a given obstacle in the virtual grid. If the obstacle is not there then it
 * will create one
 * @param {*} id aruco marker
 */
function updateVirtualObstacle(id) {
  let { width, height, real_bottom_left } =
    cameraController.getObjectPositionInfo(id);

  let { image, image_rotate_90 } = getAssetImages(id);

  if (!grid.obstacles[id]) {
    if (!(id in OBJECT_SIZES)) {
      console.log(`Couldnt find size information for id =${id} `);
    }

    let { success, obstacle } = grid.add_obstacle({
      id: id,
      real_bottom_left: real_bottom_left,
      relative_anchor: [0, 0], //All obstacles will be created this way
      width: width,
      height: height,
      image,
      image_rotate_90,
    });
    if (success) {
      //   socket.emit("add_obstacle", { obstacle, virtualGrid: grid.toJSON() });
    }
  } else {
    let update = { width, height, real_bottom_left };
    let { success } = grid.update_obstacle(id, update);
    if (success) {
      // socket.emit("update_obstacle", {
      //   id,
      //   update,
      //   virtualGrid: grid.toJSON(),
      // });
    }
  }
}
/**
 * Updates position of a given coin in the virtual grid. If the coin is not there then it
 * will create one
 * @param {*} id aruco marker
 */
function updateVirtualCoin(id_or_color, is_color = false) {
  let id, width, height, real_bottom_left;
  let { image, image_rotate_90, coin_collect_type } = getAssetImages(
    id_or_color,
    is_color
  );
  //Regular Aruco detection
  if (!is_color) {
    id = id_or_color;
    ({ width, height, real_bottom_left } =
      cameraController.getObjectPositionInfo(id));
  } else {
    ({ id, width, height } = COLOR_SIZES[id_or_color]);
    let [top_left_x, top_left_y] = cameraController.getGridPosition(
      id_or_color,
      true
    );
    //As coordinates returned for `getGridPosition` are for the top left corner of the colored
    real_bottom_left = [top_left_x, top_left_y - height + 1];
  }

  if (!grid.coins[id]) {
    if (!(id in OBJECT_SIZES)) {
      console.log(`[COIN] Couldnt find size information for id =${id} `);
    }

    let res = grid.add_coin({
      id: id,
      real_bottom_left: real_bottom_left,
      relative_anchor: [0, 0], //All coins will be created this way
      width: width,
      height: height,
      image,
      image_rotate_90,
      coin_collect_type,
    });
    let { success, coin } = res;
    if (!success) {
      console.log(`Couldn't add object with id ${id}. Response:`);
      console.log(res);
    } else {
      //   socket.emit("add_coin", { coin, virtualGrid: grid.toJSON() });
    }
  } else {
    let update = { width, height, real_bottom_left };
    let res = grid.update_coin(id, update);
    let { coin, success } = res;
    if (!success) {
      console.log(`Couldn't update object with id ${id}. Response:`);
      console.log(res);
    } else {
      //   socket.emit("update_coin", { id, update, virtualGrid: grid.toJSON() });
    }
  }
}
/**
 * Updates virtual positions of all aruco markers found in currentVectors
 */
function updateVirtualObjects() {
  if (!cameraController.foundProjectionMatrix()) {
    return;
  }
  for (let id in cameraController.currentVectors) {
    let typeObj = getTypeObject(id);
    if (!typeObj) {
      continue;
    }
    id = Number(id);
    if (typeObj === BOT_TYPE) {
      updateVirtualBot(id);
    } else if (typeObj === OBSTACLE_TYPE) {
      updateVirtualObstacle(id);
    } else if (typeObj === COIN_TYPE) {
      updateVirtualCoin(id);
    }
  }
  for (let color in cameraController.colorInfo) {
    updateVirtualCoin(color, true);
  }
}
function updateAppearInfo() {}
/**
 * Runs through every frames, and detects updates in position
 * for the objects.
 *
 * @returns
 */
function processVideo() {
  if (!cameraController.isCameraActive) {
    return;
  }
  let begin = Date.now();
  context.drawImage(videoObj, 0, 0, cameraWidth, cameraHeight);
  let imageData = context.getImageData(0, 0, cameraWidth, cameraHeight);
  let currentMarkers = cameraController.findArucoCodes(imageData);
  let currentColors = cameraController.filterColor(
    imageData,
    [0, 0, 0],
    [0, 0, 255]
  );
  if (
    cameraController.foundAllCorners() &&
    !cameraController.foundProjectionMatrix()
  ) {
    cameraController.findProjectionMatrix();
  }
  if (!context) {
    console.log("Not context!");
  } else {
    cv.imshow("arucoCanvasDebug", cameraController.debug);
    cameraController.projectFrameToGrid(); //Populates cameraController.dst
    let hide_grid = arucoCanvasOutputGrid.hasAttribute("hide-grid");
    if (!hide_grid) {
      cameraController.drawGridLines();
    }

    //Updating appear info of the newly found
    for (let possible_marker_id in OBJECT_SIZES) {
      let appeared = currentMarkers[possible_marker_id] ? 1 : 0;
      cameraController.updateMarkerAppear(possible_marker_id, appeared);
    }
    for (let color in COLOR_SIZES) {
      let appeared = currentColors[color] ? 1 : 0;
      let { id } = COLOR_SIZES[color];
      cameraController.updateMarkerAppear(id, appeared);
    }

    updateVirtualObjects(); //Use new aruco positions/colors to update Virtual objects

    try {
      //TODO: Figure out why is this necessary, maybe because the camera coefficients
      //TODO 2: Maybe create a copy before moving
      cv.flip(cameraController.dst, cameraController.dst, 0);
      cv.imshow("arucoCanvasOutputGrid", cameraController.dst); // canvasOutput is the id of another <canvas>;
    } catch (e) {
      log("[processVideo] Uh oh..there was an error:");
      log(e);
    }
  }
  // schedule next one.
  let delay = 1000 / FPS - (Date.now() - begin);

  setTimeout(processVideo, delay);
}

updateCornersButton.addEventListener("click", findHomographicMatrix);
