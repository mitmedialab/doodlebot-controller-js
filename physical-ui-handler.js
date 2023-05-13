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
let is_own_camera = false;
window.allDoodlebots = allDoodlebots;

let DOODLEBOT_ID_TO_ARUCO_ID = {
  "Doodlebot Samba\r\n": 1,
  "Doodlebot Banksy": 2,
  "Doodlebot Bluefruit52": 1,
};
/*
  Mapping between doodlebot BLE ids to aruco ids
  This allows the connection between physical bots and virtual bots
*/
// let ARUCO_ID_TO_DOODLEBOT_ID = {
//   // 1: "Xcuis/UrHNMN+oXjCB5Ldg==",
//   // 1: "90pOM2ntPK3x6YVsJD0UBA==",
//   // 2: "rNmwnlbopAuiAnTpSxnPRw=="
//   //   1: "Doodlebot Samba\r\n",
//   //   2: "Doodlebot Banksy",
//   1: "Doodlebot Bluefruit52",
// };
let ARUCO_ID_TO_DOODLEBOT_ID = {};

window.DOODLEBOT_ID_TO_ARUCO_ID = DOODLEBOT_ID_TO_ARUCO_ID;
window.ARUCO_ID_TO_DOODLEBOT_ID = ARUCO_ID_TO_DOODLEBOT_ID;

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

    if (!(name in DOODLEBOT_ID_TO_ARUCO_ID)) {
      console.log(`Name ${name} does not appear in DOODLEBOT_ID_TO_ARUCO_ID`);
    }
    currentBotId = DOODLEBOT_ID_TO_ARUCO_ID[name];
    ARUCO_ID_TO_DOODLEBOT_ID[currentBotId] = name;

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
let context = arucoCanvasOutputGridOriginal.getContext("2d", {
  willReadFrequently: true,
});

//OpenCv variables

// Number of frames to check to figure out whether a marker is still on the board
let numFrames = 200;
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
    templates: {
      None: "doodlebot_alone",
      City: "robot_1",
      School: "robot_3",
      Pacman: "pacman",
    },
  },
  2: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 52,
    templates: {
      None: "doodlebot_cowboy",
      City: "robot_2",
      School: "doodlebot_cowboy",
      Pacman: "ghost_blue",
    },
  },
  3: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 53,
    templates: {
      None: "doodlebot_alone",
      City: "robot_1",
      School: "robot_3",
      Pacman: "ghost_orange",
    },
  },
  4: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 54,
    templates: {
      None: "doodlebot_cowboy",
      City: "robot_2",
      School: "doodlebot_cowboy",
      Pacman: "ghost_pink",
    },
  },
  5: {
    type: BOT_TYPE,
    width: 5,
    height: 5,
    relative_anchor: [2, 2],
    direction_id: 55,
    templates: {
      None: "doodlebot_alone",
      City: "robot_1",
      School: "robot_3",
      Pacman: "ghost_red",
    },
  }, //TODO: Put back when obstacle's other_corner is set to another id
  // obstacles
  11: {
    type: OBSTACLE_TYPE,
    width: 3,
    height: 1,
    other_corner_id: 61,
    templates: {
      None: "building",
      City: "hedge",
      School: "hedge",
      Pacman: "pacman_wall",
    },
  },
  12: {
    type: OBSTACLE_TYPE,
    width: 3,
    height: 1,
    other_corner_id: 62,
    templates: {
      None: "brickwall",
      City: "river",
      School: "brickwall",
      Pacman: "pacman_wall",
    },
  },
  13: {
    type: OBSTACLE_TYPE,
    width: 2,
    height: 1,
    other_corner_id: 63,
    templates: {
      None: "building",
      City: "hedge",
      School: "hedge",
      Pacman: "pacman_wall",
    },
  },
  14: {
    type: OBSTACLE_TYPE,
    width: 3,
    height: 1,
    other_corner_id: 64,
    templates: {
      None: "brickwall",
      City: "river",
      School: "brickwall",
      Pacman: "pacman_wall",
    },
  },
  15: {
    type: OBSTACLE_TYPE,
    width: 3,
    height: 1,
    other_corner_id: 65,
    templates: {
      None: "building",
      City: "hedge",
      School: "hedge",
      Pacman: "pacman_wall",
    },
  },
  16: {
    type: OBSTACLE_TYPE,
    width: 3,
    height: 1,
    other_corner_id: 66,
    templates: {
      None: "brickwall",
      City: "river",
      School: "brickwall",
      Pacman: "pacman_wall",
    },
  },
  // coins
  21: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "coffee",
      School: "coffee_school",
      Pacman: "pacman_food",
    },
  },
  22: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "pizza",
      School: "pizza_school",
      Pacman: "pacman_cherry",
    },
  },
  23: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "coffee",
      School: "coin_school",
      Pacman: "pacman_food",
    },
  },
  24: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "pizza",
      School: "coffee_school",
      Pacman: "pacman_cherry",
    },
  },
  25: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "coffee",
      School: "pizza_school",
      Pacman: "pacman_food",
    },
  },
  26: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "pizza",
      School: "coffee_school",
      Pacman: "pacman_cherry",
    },
  },
  27: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "coffee",
      School: "pizza_school",
      Pacman: "pacman_food",
    },
  },
  28: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "pizza",
      School: "coffee_school",
      Pacman: "pacman_cherry",
    },
  },
  29: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "coffee",
      School: "pizza_school",
      Pacman: "pacman_food",
    },
  },
  30: {
    type: COIN_TYPE,
    width: 1,
    height: 1,
    templates: {
      None: "coin",
      City: "pizza",
      School: "coffee_school",
      Pacman: "pacman_cherry",
    },
  },
};
const COLOR_SIZES = {
  PINK: {
    id: 26,
    type: COIN_TYPE,
    width: 3,
    height: 3,
    templates: {
      None: "coin",
      City: "coffee",
      School: "coin_school",
      Pacman: "pacman_food",
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
    // Show the Camera IP input
    remote_ip_container.classList.remove("remote-ip-hidden");
    remote_ip_connect.disabled = false;
    remote_ip_input.disabled = false;
  } else {
    console.log("Deactivating camera");
    remote_ip_container.classList.add("remote-ip-hidden");
    if (cameraController) {
      cameraController.deactivateCamera();
    }
  }
});
const setupCameraStream = async (options = {}) => {
  cameraWidth = cell_size * cols;
  cameraHeight = cell_size * rows;
  window.cameraWidth = cameraWidth;
  window.cameraHeight = cameraHeight;

  let constraints = { ...cameraConstraints, width: cameraWidth };

  let ip = remote_ip_input.value;
  is_own_camera = ip === "0" && !options.is_remote;

  if (is_own_camera) {
    let stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoObj.srcObject = stream;
    live_updates.activate_camera({});
  } else {
    // let url = `http://${ip}/mjpeg`;
    let port = 56000 + currentBotId;
    let url = `http://${laptop_ip}:${port}/mjpeg`;
    console.log(url);
    image_from_stream.setAttribute("crossOrigin", "anonymous"); //To be able to draw and read from canvas
    image_from_stream.src = url; //+ "?" + new Date().getTime();
    //TODO: If it's invalid url, say so
  }

  arucoCanvasOutputGridOriginal.setAttribute("height", cameraHeight + "px");
  arucoCanvasOutputGridOriginal.setAttribute("width", cameraWidth + "px");

  cameraController = new CameraController(
    cameraMatrix,
    distCoeffs,
    cameraHeight,
    cameraWidth,
    cameraConstraints,
    log,
    numFrames, // to detect dissapeared frames
    is_own_camera
  );
  cameraController.activateCamera();
  window.cameraController = cameraController;
  remote_ip_connect.disabled = true; //Once set don't do anything
  remote_ip_input.disabled = true; //Once set don't do anything
  //create grid
  // currentBotId = 1; //TODO: For now hardcode, later change
  processVideo();
};
window.setupCameraStream = setupCameraStream;
remote_ip_connect.addEventListener("click", async (evt) => {
  await setupCameraStream();
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
const getTemplateForId = (aruco_id, is_color = false) => {
  let info = is_color ? COLOR_SIZES : OBJECT_SIZES;

  if (!(aruco_id in info)) {
    console.log(`Invalid ${aruco_id}: not in OBJECT_SIZES`);
    return null;
  }
  if (!info[aruco_id].templates) {
    console.log(`Invalid ${aruco_id}: no template`);
    return null;
  }
  if (!info[aruco_id].templates[selectedOption]) {
    console.log(`Invalid ${aruco_id}: no templates.${selectedOption}`);
    return null;
  }
  return info[aruco_id].templates[selectedOption];
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
  let template_id = getTemplateForId(id);
  let assets = ALL_ASSETS[template_id];
  let { image, image_rotate_90 } = assets;

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
      template_id: template_id,
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
    }
  } else {
    let bot = grid.bots[id][0];
    let prev_grid_x = bot.real_bottom_left[0] + bot.relative_anchor[0];
    let prev_grid_y = bot.real_bottom_left[1] + bot.relative_anchor[1];

    let is_same =
      bot.angle === angle && gridX === prev_grid_x && gridY === prev_grid_y;
    //Only update if something changes
    if (!is_same) {
      let update = {
        angle: angle,
        realAngle: realAngle,
        real_anchor: [gridX, gridY],
      };
      let { success, message } = grid.update_bot(id, update);
      if (!success) {
        console.log(`Couldn't update bot ${id}: ${message}`);
      } else {
      }
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
  let template_id = getTemplateForId(id);
  let assets = ALL_ASSETS[template_id];
  let { image, image_rotate_90 } = assets;

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
      template_id: template_id,
    });
  } else {
    let obstacle = grid.obstacles[id][0];
    let is_same =
      obstacle.width === width &&
      obstacle.height === height &&
      obstacle.real_bottom_left[0] === real_bottom_left[0] &&
      obstacle.real_bottom_left[1] == real_bottom_left[1];
    if (!is_same) {
      let update = { width, height, real_bottom_left };
      let { success } = grid.update_obstacle(id, update);
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
  let template_id = getTemplateForId(id_or_color, is_color);
  let assets = ALL_ASSETS[template_id];
  let { image, image_rotate_90, coin_collect_type } = assets;
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
      template_id,
    });
    let { success, coin } = res;
    if (!success) {
      console.log(`Couldn't add object with id ${id}. Response:`);
      console.log(res);
    }
  } else {
    let coin = grid.coins[id][0];
    let is_same =
      coin.width === width &&
      coin.height === height &&
      coin.real_bottom_left[0] === real_bottom_left[0] &&
      coin.real_bottom_left[1] == real_bottom_left[1];

    if (!is_same) {
      let update = { width, height, real_bottom_left };
      let res = grid.update_coin(id, update);
      let { coin, success } = res;
      if (!success) {
        console.log(`Couldn't update object with id ${id}. Response:`);
        console.log(res);
      }
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
function removeUnseenMarkers() {
  for (let possible_marker_id in OBJECT_SIZES) {
    if (!cameraController.isInBoard(possible_marker_id)) {
      possible_marker_id = Number(possible_marker_id);
      if (possible_marker_id in cameraController.currentVectors) {
        console.log(
          `Dont detect marker ${possible_marker_id} from board so also delete it from currentVectors`
        );
        delete cameraController.currentVectors[possible_marker_id];
      }
      // If not in board anymore, delete it from the virtual grid
      if (possible_marker_id in grid.bots) {
        // Don't remove bots for now, just wait until they are detected again
        // grid.remove_bot(possible_marker_id);
      } else if (possible_marker_id in grid.obstacles) {
        let obstacle = grid.obstacles[possible_marker_id][0];
        grid.remove_obstacle(possible_marker_id);
        live_updates.remove_obstacle({
          obstacle,
          virtualGrid: grid.toJSON(),
        });
      } else if (possible_marker_id in grid.coins) {
        let coin = grid.coins[possible_marker_id][0];
        grid.remove_coin(possible_marker_id);
        live_updates.remove_coin({ coin, virtualGrid: grid.toJSON() });
      }
    } else {
      //It's still in board
      // if (grid && possible_marker_id in grid.coins){
      //   updateCoinInfo(possible_marker_id);
      // }
    }
  }
}
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
  if (cameraController.is_own_camera) {
    context.drawImage(videoObj, 0, 0, cameraWidth, cameraHeight);
  } else {
    context.drawImage(image_from_stream, 0, 0, cameraWidth, cameraHeight);
  }
  // context.globalAlpha = 0.5;
  // context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  // processVideo();
  // return;
  let imageData = context.getImageData(0, 0, cameraWidth, cameraHeight);
  // let imageData = context.getImageData();
  cameraController.setupFrame(imageData); //Populates cameraController.src
  let currentMarkers = cameraController.findArucoCodes(imageData);
  // console.log(imageData);
  // console.log(currentMarkers);
  //   let currentColors = cameraController.filterColor(
  //     imageData,
  //     [0, 0, 0],
  //     [0, 0, 255]
  //   );
  let currentColors = {};

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
    cameraController.reduceGridOpacty();
    let hide_grid = arucoCanvasOutputGrid.hasAttribute("hide-grid");
    if (!hide_grid) {
      cameraController.drawGridLines();
    }
    if (cameraController.is_own_camera) {
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
      // Deleting whatever needs to be deleted
      removeUnseenMarkers();
      updateVirtualObjects(); //Use new aruco positions/colors to update Virtual objects
    }

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

updateCornersButton.addEventListener("click", () =>
  cameraController.findProjectionMatrix()
);
