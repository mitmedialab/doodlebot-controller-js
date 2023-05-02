import { setupDraggable, setupGridDropzone } from "./test-interact.js";

//to know the selected theme and change the background accordingly
var body = document.getElementById("body");
var urlParams = new URLSearchParams(window.location.search);
var selectedOption = urlParams.get("option");
window.selectedOption = selectedOption;
var selectedMode = urlParams.get("mode");
body.setAttribute("current-mode", selectedMode);
window.selectedMode = selectedMode; //make it global

console.log(selectedOption);
console.log(selectedMode);

if (selectedOption == "City") {
  body.className =
    "background2 d-flex justify-content-center align-items-center vh-100";
} else if (
  selectedOption == "None" ||
  selectedOption === undefined ||
  selectedOption === null
) {
  body.className =
    "background1 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "School") {
  body.className =
    "background4 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "Pacman") {
  body.className =
    "background3 d-flex justify-content-center align-items-center vh-100";
} else {
  body.className =
    "background1 d-flex justify-content-center align-items-center vh-100";
}

//if the mode is Real Video Stream --> Display blutooth, camera_settings, and activate_camera buttons
var activate_camera_checkbox = document.getElementById("activate_camera_div");
var bluetooth_button = document.getElementById("bluetooth_button");
var camera_settings = document.getElementById("camera_settings");
// if (selectedMode == "camera") {
//   activate_camera_checkbox.style.display = "block";
//   bluetooth_button.style.display = "block";
//   camera_settings.style.display = "block";
// } else if (selectedMode == "virtual") {
//   activate_camera_checkbox.style.display = "none";
//   bluetooth_button.style.display = "none";
//   camera_settings.style.display = "none";
// }

//handle the modal
// const camera_settings = document.getElementById("camera_settings");
const myModal = document.getElementById("myModal");
const close = document.getElementsByClassName("close")[0];

// When the user clicks the link, open the modal
camera_settings.onclick = function () {
  myModal.style.display = "block";
  document.getElementsByClassName("modal").style.backgroundColor =
    "rgba(0,0,0,0.6)";
};

// When the user clicks on <span> (x), close the modal
close.onclick = function () {
  myModal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == myModal) {
    myModal.style.display = "none";
  }
};

//get the divs of bots, obstacles, and coins to display the images
var botsDiv = document.getElementById("bots");
var obstaclesDiv = document.getElementById("obstacles");
var coinsDiv = document.getElementById("coins");
var waitingRoom = document.getElementById("waitingRoom");

let grid;

// TODO: This info should depende on how good it'll look in the screen
var rows = 16; //was 10
var cols = 16; //was 20
var cell_size = 40; //was 60
// Just so that they become global variables
window.rows = rows;
window.cols = cols;
window.cell_size = cell_size;

let ASSETS_FOLDER = "../assets/";
const COIN_COLLECT_TYPES = {
  COIN: "Coin",
  PIZZA: "Pizza",
  COFFEE: "Coffee",
  STAR: "Star",
  CHERRY: "Cherry",
  FOOD: "Food",
};
window.COIN_COLLECT_TYPES = COIN_COLLECT_TYPES;
// Should place everything here.
// There will be no resizing, so the width and height are fixed.
const ALL_ASSETS = {
  ///////////////////////None theme//////////////////////
  doodlebot_alone: {
    image: ASSETS_FOLDER + "None_DoodleBot.png",
    width: 3, //1.9,
    height: 3, //1.7,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "None",
  },
  doodlebot_cowboy: {
    image: ASSETS_FOLDER + "None_DoodleBot_Cowboy.png",
    width: 3, //1.9,
    height: 3, //1.7,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "None",
  },
  robot_1: {
    image: ASSETS_FOLDER + "DB_Robot_1.png",
    width: 3, //1.9,
    height: 3, //2
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "None",
  },
  robot_2: {
    image: ASSETS_FOLDER + "DB_Robot_2.png",
    width: 3, //1.9,
    height: 3,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "None",
  },
  robot_3: {
    image: ASSETS_FOLDER + "DB_Robot_3.png",
    width: 3, //1.9,
    height: 3,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "None",
  },
  building: {
    image: ASSETS_FOLDER + "None_Building.png",
    width: 1, //1.1,
    height: 2,
    type: OBSTACLE_TYPE,
    theme: "None",
    template_cell_size: 40,
  },
  coin: {
    image: ASSETS_FOLDER + "None_Coin.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "None",
    coin_collect_type: COIN_COLLECT_TYPES.COIN,
  },
  star: {
    image: ASSETS_FOLDER + "Star_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "None",
    coin_collect_type: COIN_COLLECT_TYPES.STAR,
  },
  ///////////////////////City theme//////////////////////
  car_1: {
    image: ASSETS_FOLDER + "DB_Car_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_1_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  car_2: {
    image: ASSETS_FOLDER + "DB_Car_2.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_2_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  car_3: {
    image: ASSETS_FOLDER + "DB_Car_3.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_3_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  truck_1: {
    image: ASSETS_FOLDER + "DB_Truck_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Truck_1_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  bush: {
    image: ASSETS_FOLDER + "DB_Bush_1.png",
    width: 1, //1.7,
    height: 1, //1.7,
    type: OBSTACLE_TYPE,
    theme: "City",
    template_cell_size: 40,
  },
  river: {
    image: ASSETS_FOLDER + "DB_River_1.png",
    width: 1,
    height: 2,
    type: OBSTACLE_TYPE,
    theme: "City",
    template_cell_size: 40,
  },
  coffee: {
    image: ASSETS_FOLDER + "DB_Coffee_1.png",
    width: 1, //1.2,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "City",
    coin_collect_type: COIN_COLLECT_TYPES.COFFEE,
  },
  pizza: {
    image: ASSETS_FOLDER + "DB_Pizza_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "City",
    coin_collect_type: COIN_COLLECT_TYPES.PIZZA,
  },
  ///////////////////////Pacman theme//////////////////////
  pacman: {
    image: ASSETS_FOLDER + "DB_Pacman_1.png",
    width: 3, //1.5,
    height: 3, //1.5,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "Pacman",
  },
  ghost_blue: {
    image: ASSETS_FOLDER + "DB_GhostBlue_1.png",
    width: 3, //1.5,
    height: 3, //1.7,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "Pacman",
  },
  ghost_orange: {
    image: ASSETS_FOLDER + "DB_GhostOrange_1.png",
    width: 3, //1.5,
    height: 3, //1.7,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "Pacman",
  },
  ghost_pink: {
    image: ASSETS_FOLDER + "DB_GhostPink_1.png",
    width: 3, //1.5,
    height: 3, //1.7,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "Pacman",
  },
  ghost_red: {
    image: ASSETS_FOLDER + "DB_GhostRed_1.png",
    width: 3, //1.5,
    height: 3, //1.7,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "Pacman",
  },
  pacman_wall: {
    image: ASSETS_FOLDER + "DB_PacmanWall_1.png",
    width: 1, //0.7,
    height: 2,
    type: OBSTACLE_TYPE,
    theme: "Pacman",
  },
  pacman_cherry: {
    image: ASSETS_FOLDER + "DB_PacmanCherry_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "Pacman",
    coin_collect_type: COIN_COLLECT_TYPES.CHERRY,
  },
  pacman_food: {
    image: ASSETS_FOLDER + "DB_PacmanFood_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "Pacman",
    coin_collect_type: COIN_COLLECT_TYPES.FOOD,
  },
  ///////////////////////School theme//////////////////////
  bicycle: {
    image: ASSETS_FOLDER + "DB_Bicycle_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Bicycle_1_rotate_90.png",
    width: 1, //1.5,
    height: 2, //1.5,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "School",
    template_cell_size: 40,
  },
  school_bus: {
    image: ASSETS_FOLDER + "DB_SchoolBus_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_SchoolBus_1_rotate_90.png",
    width: 1, //1.5,
    height: 2, //1.7,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "School",
    template_cell_size: 40,
  },
  brickwall: {
    image: ASSETS_FOLDER + "DB_Brickwall_1.png",
    width: 1, //1.5,
    height: 2, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 40,
  },
  building_roof_1: {
    image: ASSETS_FOLDER + "DB_BuildingRoof_1.png",
    width: 1, //1.5,
    height: 1, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 40,
  },
  building_roof_2: {
    image: ASSETS_FOLDER + "DB_BuildingRoof_2.png",
    width: 1, //1.5,
    height: 2, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 40,
  },
  hedge: {
    image: ASSETS_FOLDER + "DB_Hedge_1.png",
    width: 1, //0.7,
    height: 2,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 40,
  },
  coffee_school: {
    image: ASSETS_FOLDER + "DB_Coffee_1.png",
    width: 1, //1.2,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "School",
    coin_collect_type: COIN_COLLECT_TYPES.COFFEE,
  },
  pizza_school: {
    image: ASSETS_FOLDER + "DB_Pizza_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "School",
    coin_collect_type: COIN_COLLECT_TYPES.PIZZA,
  },
  coin_school: {
    image: ASSETS_FOLDER + "None_Coin.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "None",
    coin_collect_type: COIN_COLLECT_TYPES.COIN,
  },
};
window.ALL_ASSETS = ALL_ASSETS;
/**
 * Creates a grid where each cell is cell_size px x cell_size px
 * and places it on `gridContainer`
 *
 * @param {*} rows number of rows
 * @param {*} cols number of columns
 * @param {*} cell_size size of each cell
 */
const createDOMGrid = (rows, cols, cell_size) => {
  //TODO: Have this info come from the theme previously chosen
  console.log(selectedOption);
  gridContainer.style.height = `${rows * cell_size}px`;
  gridContainer.style.width = `${cols * cell_size}px`;

  if (selectedOption == "None") {
    gridContainer.style.backgroundImage =
      "url(../assets/None_background_cropped.png)";
    // gridContainer.style.height = "400px";
    // gridContainer.style.width = "580px";
  } else if (selectedOption == "City") {
    gridContainer.style.backgroundImage = "url(../assets/DB_CityGridBG_2.png)";
    // gridContainer.style.height = "400px";
    // gridContainer.style.width = "580px";
  } else if (selectedOption == "Pacman") {
    gridContainer.style.backgroundImage =
      "url(../assets/DB_PacmanGridBG_1.png)";
    // gridContainer.style.height = "400px";
    // gridContainer.style.width = "580px";
  } else if (selectedOption == "School") {
    gridContainer.style.backgroundImage =
      "url(../assets/DB_SchoolGridBG_1.png)";
    // gridContainer.style.height = "400px";
    // gridContainer.style.width = "580px";
  } else {
    gridContainer.style.backgroundImage =
      "url(../assets/None_background_cropped.png)";
    // gridContainer.style.height = "400px";
    // gridContainer.style.width = "580px";
  }

  let colNumbersDiv = document.createElement("div");
  colNumbersDiv.classList.add("grid-row");
  let empty = document.createElement("div");
  empty.classList.add("cell-column-text");
  colNumbersDiv.appendChild(empty);
  for (let i = rows - 1; i >= 0; i--) {
    let row = document.createElement("div");
    row.classList.add("grid-row");

    // let rowNumberDiv = document.createElement("div");
    // rowNumberDiv.classList.add("cell-row-text");
    // rowNumberDiv.innerHTML = `Row ${i}`;
    // rowNumberDiv.style.width = `${cell_size}px`;
    // rowNumberDiv.style.height = `${cell_size}px`;
    // row.appendChild(rowNumberDiv);
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("div");
      cell.classList.add("grid-column");
      cell.style.width = `${cell_size}px`;
      cell.style.height = `${cell_size}px`;

      row.appendChild(cell);

      // if (i === 0) {
      //   let colDiv = document.createElement("div");
      //   colDiv.classList.add("cell-column-text");
      //   colDiv.innerHTML = `Col ${j}`;
      //   colDiv.style.width = `${cell_size}px`;
      //   colDiv.style.height = `${cell_size}px`;
      //   colNumbersDiv.appendChild(colDiv);
      // }
    }
    gridContainer.appendChild(row);
  }
  gridContainer.appendChild(colNumbersDiv);
};

/////////////////////////////////////////////////////////////////////

//Add Bots
const addBotTemplate = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  let { image, width, height, type, template_cell_size } =
    ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("id", template_id);
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  if (!template_cell_size) {
    template_cell_size = 20;
  }
  imageEl.style.width = `${template_cell_size * width}px`;
  imageEl.style.height = `${template_cell_size * height}px`;
  imageEl.style.padding = `5px`;

  botsDiv.appendChild(imageEl);
  // waitingRoom.appendChild(imageEl);
};

//Add obstacles
const addObstacleTemplate = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  let { image, width, height, type, template_cell_size } =
    ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("id", template_id);
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  if (!template_cell_size) {
    template_cell_size = 30;
  }
  imageEl.style.width = `${template_cell_size * width}px`;
  imageEl.style.height = `${template_cell_size * height}px`;
  imageEl.style.padding = `5px`;

  obstaclesDiv.appendChild(imageEl);
  // waitingRoom.appendChild(imageEl);
};

//Add coins
const addCoinTemplate = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  let { image, width, height, type, template_cell_size } =
    ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("id", template_id);
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  if (!template_cell_size) {
    template_cell_size = 40;
  }
  imageEl.style.width = `${template_cell_size * width}px`;
  imageEl.style.height = `${template_cell_size * height}px`;
  imageEl.style.padding = `5px`;

  coinsDiv.appendChild(imageEl);
  // waitingRoom.appendChild(imageEl);
};
let videoObj = document.getElementById("videoId");

document.addEventListener("DOMContentLoaded", () => {
  //   setupSocket();
  if (selectedMode === "virtual") {
    createDOMGrid(rows, cols, cell_size);
  } else {
    canvasContainer.style.width = `${cell_size * cols}px`;
    canvasContainer.style.height = `${cell_size * rows}px`;

    videoObj.setAttribute("width", cell_size * cols);
    videoObj.setAttribute("height", cell_size * rows);
  }

  grid = new VirtualGrid(rows, cols, {
    onAddBot,
    onAddObstacle,
    onAddCoin,
    onPickupCoin,
    onUpdateObject,
  });
  window.grid = grid;
  // TODO: show the necessary templates given the selected theme
  // might need to add 'theme' key to ALL_ASSETS
  let templates_to_show = [];
  let bots = [];
  let obstacles = [];
  let coins = [];
  if (selectedOption == "None") {
    templates_to_show = [
      "doodlebot_alone",
      "doodlebot_cowboy",
      "robot_1",
      "robot_2",
      "robot_3",
      "building",
      "coin",
      "star",
    ];
    bots = [
      "doodlebot_alone",
      "doodlebot_cowboy",
      "robot_1",
      "robot_2",
      "robot_3",
    ];
    obstacles = ["building"];
    coins = ["coin", "star"];
  } else if (selectedOption == "City") {
    templates_to_show = [
      "car_1",
      "car_2",
      "car_3",
      "truck_1",
      "river",
      "bush",
      "pizza",
      "coffee",
    ];
    bots = ["car_1", "car_2", "car_3", "truck_1"];
    obstacles = ["building", "river", "bush"];
    coins = ["pizza", "coffee"];
  } else if (selectedOption == "Pacman") {
    templates_to_show = [
      "pacman",
      "ghost_pink",
      "ghost_blue",
      "ghost_orange",
      "ghost_red",
      "pacman_wall",
      "pacman_cherry",
      "pacman_food",
    ];
    bots = ["pacman", "ghost_pink", "ghost_blue", "ghost_orange", "ghost_red"];
    obstacles = ["pacman_wall"];
    coins = ["pacman_cherry", "pacman_food"];
  } else if (selectedOption == "School") {
    templates_to_show = [
      "bicycle",
      "school_bus",
      "building_roof_1",
      "building_roof_2",
      "hedge",
      "brickwall",
      "coffee_school",
      "pizza_school",
      "coin_school",
    ];
    bots = ["bicycle", "school_bus"];
    obstacles = ["building_roof_1", "building_roof_2", "hedge", "brickwall"];
    coins = ["coffee_school", "pizza_school", "coin_school"];
  } else {
    templates_to_show = [
      "doodlebot_alone",
      "doodlebot_cowboy",
      "robot_1",
      "robot_2",
      "robot_3",
      "building",
      "coin",
      "star",
    ];
    bots = [
      "doodlebot_alone",
      "doodlebot_cowboy",
      "robot_1",
      "robot_2",
      "robot_3",
    ];
    obstacles = ["building"];
    coins = ["coin", "star"];
  }
  // for (let template_id of templates_to_show) {
  //   addTemplateDiv(template_id);
  // }
  if (selectedMode === "virtual") {
    for (let template_id of bots) {
      addBotTemplate(template_id);
    }
    for (let template_id of obstacles) {
      addObstacleTemplate(template_id);
    }
    for (let template_id of coins) {
      addCoinTemplate(template_id);
    }
    setupDraggable(".template", cell_size); //Make all templates draggable
    setupGridDropzone(cell_size); // To style the grid when an object can be dropped
  }
});
/**
 * If a coin has been picked up, remove it from the screen
 * @param {*} bot
 * @param {*} coin
 */
const onPickupCoin = (bot, coin) => {
  let dom_id = `${COIN_TYPE}-${coin.id}`;
  document.getElementById(dom_id).remove();
};
/**
 * An object has been updated, so this deletes
 * the previous div and creates a new one with the new
 * info.
 *
 * If could be possible to update the existing div instead of deleting
 * it and redoing it. However this is easier to write and doesn't *seem*
 * to hinder performance too much.
 *
 * @param {*} updatedObject
 */
const onUpdateObject = (updatedObject) => {
  let DOM_ID = `${updatedObject.type}-${updatedObject.id}`;
  let div = document.getElementById(DOM_ID);
  div.remove(); //Not needed anymore, but paint the object again
  if (selectedMode === "camera") {
    //Also remove the template as it'll get created again
    let template = document.getElementById(getAssetTemplate(updatedObject.id));
    template.remove();
  }

  let { type } = updatedObject;
  if (type === BOT_TYPE) {
    onAddBot(updatedObject);
  } else if (type === OBSTACLE_TYPE) {
    onAddObstacle(updatedObject);
  } else if (type === COIN_TYPE) {
    onAddCoin(updatedObject);
  }
};
/**
 * Assumes a bot with id `bot-id` exists
 * @param {*} bot
 */
const addRotateBotIcon = (bot) => {
  let DOM_ID = `${BOT_TYPE}-${bot.id}`;
  let bot_dom = document.getElementById(DOM_ID);
  let rotateArrow = document.createElement("div");
  rotateArrow.innerText = "⟲";
  rotateArrow.classList.add("rotation-handle");
  rotateArrow.addEventListener("click", () => {
    console.log("Tyring to turn 90");
    grid.turn_bot(bot.id, 90);
  });
  bot_dom.appendChild(rotateArrow);
};
/**
 * A bot has been created on the VirtualGrid system. This method
 * creates the image in the grid at the necessary position with a turn handler
 */
const drawBot = (bot) => {
  let {
    width,
    height,
    image,
    image_rotate_90,
    real_bottom_left: [i, j],
    angle,
  } = bot;

  //Creating a div at the given position
  let bot_dom = document.createElement("div");
  let DOM_ID = `${BOT_TYPE}-${bot.id}`;
  bot_dom.classList.add("bot-container");
  bot_dom.classList.add("grab");
  bot_dom.setAttribute("id", DOM_ID);
  bot_dom.setAttribute("grid_object", "true");
  bot_dom.style.left = `${cell_size * i}px`;
  bot_dom.style.bottom = `${cell_size * j}px`;
  bot_dom.style.touchAction = "none";

  // Creates the underlying image, with the given dimensions and orientation
  let default_angle = image_rotate_90 && angle % 180 === 90 ? 90 : 0;
  let image_src = default_angle === 90 ? image_rotate_90 : image;
  let diff_angle = (360 + angle - default_angle) % 360;

  let imageEl = document.createElement("img");
  imageEl.classList.add("bot-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image_src);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  // Angle defined in bot is not same direction as transform expects
  imageEl.style.transform = `rotate(${360 - diff_angle}deg)`; //transform of 0 or 180 doesn't change width or height
  bot_dom.appendChild(imageEl);

  let gridContainer;
  if (selectedMode === "virtual") {
    gridContainer = document.getElementById("gridContainer");
  } else {
    gridContainer = document.getElementById("canvasContainer");
  }
  gridContainer.appendChild(bot_dom);

  return DOM_ID;
};
/**
 * An obstacle has been created on the VirtualGrid system. This method
 * creates the image in the grid at the necessary position.
 */
const drawObstacle = (obstacle) => {
  let {
    width,
    height,
    real_bottom_left: [i, j],
    image,
  } = obstacle;

  //Creating a div at the given position
  let obstacle_dom = document.createElement("div");
  let DOM_ID = `${OBSTACLE_TYPE}-${obstacle.id}`;
  obstacle_dom.classList.add("obstacle-container");
  obstacle_dom.classList.add("grab");
  obstacle_dom.setAttribute("id", DOM_ID);
  obstacle_dom.setAttribute("grid_object", "true");
  obstacle_dom.style.left = `${cell_size * i}px`;
  obstacle_dom.style.bottom = `${cell_size * j}px`;
  obstacle_dom.style.touchAction = "none";

  // Creates the underlying image, with the given dimensions and orientation
  let imageEl = document.createElement("img");
  imageEl.classList.add("obstacle-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;

  obstacle_dom.appendChild(imageEl);
  let gridContainer;
  if (selectedMode === "virtual") {
    gridContainer = document.getElementById("gridContainer");
  } else {
    gridContainer = document.getElementById("canvasContainer");
  }
  gridContainer.appendChild(obstacle_dom);

  return DOM_ID;
};
/**
 * A coin has been created on the VirtualGrid system. This method
 * creates the image in the grid at the necessary position.
 */
const drawCoin = (coin) => {
  let {
    width,
    height,
    real_bottom_left: [i, j],
    image,
  } = coin;

  //Creating a div at the given position
  let coin_dom = document.createElement("div");
  let DOM_ID = `${COIN_TYPE}-${coin.id}`;
  coin_dom.classList.add("coin-container");
  coin_dom.classList.add("grab");
  coin_dom.setAttribute("id", DOM_ID);
  coin_dom.setAttribute("grid_object", "true");
  coin_dom.style.left = `${cell_size * i}px`;
  coin_dom.style.bottom = `${cell_size * j}px`;
  coin_dom.style.touchAction = "none";

  // Creates the underlying image, with the given dimensions and orientation
  let imageEl = document.createElement("img");
  imageEl.classList.add("coin-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;

  coin_dom.appendChild(imageEl);
  let gridContainer;
  if (selectedMode === "virtual") {
    gridContainer = document.getElementById("gridContainer");
  } else {
    gridContainer = document.getElementById("canvasContainer");
  }
  gridContainer.appendChild(coin_dom);
  return DOM_ID;
};
const getAssetTemplate = (aruco_id) => {
  return OBJECT_SIZES[aruco_id].images[selectedOption];
};
/**
 * A bot has been created on the VirtualGrid system. This method:
 * 1. Creates the image in the grid at the necessary position
 * 2. Makes the created image draggable
 */
const onAddBot = (bot) => {
  let DOM_ID = drawBot(bot);
  if (selectedMode === "virtual") {
    //Makes the created div draggable
    addRotateBotIcon(bot);
    setupDraggable(`#${DOM_ID}`, cell_size);
  } else {
    addBotTemplate(getAssetTemplate(bot.id));
  }

  addBotToSelect(bot);
};
const addBotToSelect = (bot) => {};
/**
 * Pretty much the same as `onAddBot`, just that here we don't need a 'turn' icon
 *
 * @param {*} obstacle
 */
const onAddObstacle = (obstacle) => {
  let DOM_ID = drawObstacle(obstacle);
  if (selectedMode === "virtual") {
    //Makes the created div draggable
    setupDraggable(`#${DOM_ID}`, cell_size);
  } else {
    addObstacleTemplate(getAssetTemplate(obstacle.id));
  }
};
/**
 * Pretty much the same as `onAddBot`, just that here we don't need a 'turn' icon
 *
 * @param {*} obstacle
 */
const onAddCoin = (coin) => {
  let DOM_ID = drawCoin(coin);
  if (selectedMode === "virtual") {
    //Makes the created div draggable
    setupDraggable(`#${DOM_ID}`, cell_size);
  } else {
    addCoinTemplate(getAssetTemplate(coin.id));
  }

  addCoinTypeToSelect(coin);
};

const addCoinTypeToSelect = (coin) => {
  let { coin_collect_type } = coin;
  if (!coin_collect_type) {
    console.log("------------------------------------------------");
    console.log(coin);
    alert("Error: Undefined coin type, please add it on ALL_ASSETS");
    return;
  }
  if (collect_select.querySelector(`[value="${coin_collect_type}"]`)) {
    //Already exists, don't add it
    return;
  }
  let option = document.createElement("option");
  option.setAttribute("value", coin.coin_collect_type);
  option.innerText = coin.coin_collect_type;
  collect_select.appendChild(option);
};
//--------------------------- Below code controls moving -------------------------------------///

let intervals = {}; //bot_id -> interval
/**
 * If the bot is moving, it will stop (and vice versa)
 *
 * @param {*} bot_id
 * @param {*} evt
 */
async function changeMovingBot(bot_id, opt = {}) {
  let bot = grid.bots[bot_id][0];
  if (bot.isMoving) {
    bot.isMoving = false;
    if (!opt.noSocket) {
      // socket.emit("stop_bot", "");
    }
    //Stop
    console.log("stopping...");
    document.getElementById("controls").style.visibility = "visible";
    document.getElementById("objects").style.visibility = "visible";
    document.getElementById("mySidebar").style.width = "500px";
    document.getElementById("main").style.marginLeft = "500px";
    //Changing button style
    startBotsButton.innerHTML = "Start moving";
    startBotsButton.classList.remove("bot-stop");
    startBotsButton.classList.add("bot-start");

    if (selectedMode === "camera") {
      // await stopMovingBot_camera(currentBotId);
      // TODO: Check if need to do anything here
    } else {
      stopMovingBot_virtual(bot_id);
    }
  } else {
    if (!opt.noSocket) {
      // socket.emit("start_bot", "");
    }
    //Start
    bot.isMoving = true;
    console.log("starting...");
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("controls").style.visibility = "hidden";
    document.getElementById("objects").style.visibility = "hidden";
    document.getElementById("main").style.marginLeft = "250px";

    startBotsButton.innerHTML = "Stop moving";
    startBotsButton.classList.remove("bot-start");
    startBotsButton.classList.add("bot-stop");

    if (selectedMode === "camera") {
      await startMovingBot_camera(bot_id);
    } else {
      startMovingBot_virtual(bot_id);
    }
  }
}
function getRealBotFromArucoId(aruco_bot_id) {
  let doodlebot_id = ARUCO_ID_TO_DOODLEBOT_ID[aruco_bot_id];
  let realBot = allDoodlebots[doodlebot_id];
  return realBot;
}
const MAX_ATTEMPTS_TO_ALIGN_BOT = 1; //ideally at most 1 should be enough
const BOT_ANGLE_ALIGNMENT_THRESHOLD = 10; //Withing 10 degrees of the axis is still considered align
/**
 * Adjusts angle of a (real) doodlebot, making it align to one of the axis
 *
 * @param {*} aruco_bot_id
 * @returns
 */
async function adjustAngleRealBot(aruco_bot_id) {
  console.log("Adjusting angle!");
  let realBot = getRealBotFromArucoId(aruco_bot_id);
  if (!realBot) {
    return;
  }

  for (let i = 1; i <= MAX_ATTEMPTS_TO_ALIGN_BOT; i++) {
    console.log(`Attempt ${i}/${MAX_ATTEMPTS_TO_ALIGN_BOT}`);
    let bot = grid.bots[aruco_bot_id][0];
    let { angle, realAngle } = bot;
    if (angle == 0 && realAngle > 270) {
      angle = 360;
    }
    let dAngle = Math.round(angle - realAngle);
    if (Math.abs(dAngle) < BOT_ANGLE_ALIGNMENT_THRESHOLD) {
      //Already aligned, no need to keep going!
      console.log("Done aligning!");
      return;
    }
    //This method will turn right or left accordingly
    console.log(`Adjusting an angle of ${dAngle}`);
    await realBot.apply_next_move_to_bot(["turn", dAngle]);
  }
}
async function startMovingBot_camera(bot_id) {
  // Don't calculate next steps until bot has finished moving
  //If the real bot is not connected then don't do anything
  let did_bot_move = false;

  let realBot = getRealBotFromArucoId(bot_id);

  if (!realBot) {
    console.log(`Not found real bot for id ${bot_id}`);
    return;
  }
  if (realBot.isMoving) {
    console.log(`Bot ${bot_id} already moving (real life), so dont move`);
    return;
  }
  let bot = grid.bots[bot_id][0];
  if (bot.isMoving) {
    //TODO: This info should be stored in the grid object
    // let num_turns = Number(
    //   document.getElementById(`coins-policy-turns-${bot_id}`).value
    // );
    let num_turns = 1; //TODO: Add this as an option?
    let next_move = grid.get_next_move_using_policies(bot_id, num_turns);

    if (next_move) {
      await adjustAngleRealBot(bot_id);
      await realBot.apply_next_move_to_bot(next_move);
      // The video stream will update the virtual grid
      console.log("---------------------------------------");
      console.log("Making next move!");
      did_bot_move = true;
    } else {
      //If not then stop moving
      // Don't stop, just do random moves
      // bot.isMoving = false;
      // let realBot = getRealBotFromArucoId(bot_id);
      // if (realBot){
      //   realBot.isMoving = false;
      // }
    }
  }
  if (did_bot_move) {
    //Keep moving
    // await apply_next_move_to_bot(bot_id);
    await startMovingBot_camera(bot_id);
  }
  // }
}

/** Starts bot by creating a code that runs every certain time */
function startMovingBot_virtual(bot_id) {
  if (bot_id in intervals) {
    log("The bot is already moving!");
    return;
  }
  function move() {
    console.log("-------------------------MOVING-------------------");
    let num_turns = 1;
    let next_move = grid.get_next_move_using_policies(bot_id, num_turns);
    if (!next_move) {
      // No more moves, so don't do anything
      return;
    }
    console.log(next_move);
    grid.apply_next_move_to_bot(bot_id, next_move);
    // Now updte the view of the bot
    // updateBotInVirtualGrid(bot_id, BOT_TYPE);
    // Number(
    //   document.getElementById(`coins-policy-turns-${bot_id}`).value
    // );
    // let history = grid.move_bot_using_policies(
    //   bot_id,
    //   0,
    //   num_turns
    //   //   (bot_index = 0),
    //   //   (num_turns = num_turns)
    // );
    // drawBoard();
  }
  intervals[bot_id] = setInterval(move, 500);
}
/** Stops bot by deleting the interval for the bot */
function stopMovingBot_virtual(bot_id) {
  clearInterval(intervals[bot_id]);
  delete intervals[bot_id];
}
startBotsButton.addEventListener("click", async () => {
  let promises = [];
  for (let bot_id in grid.bots) {
    promises.push(changeMovingBot(bot_id));
  }
  await Promise.all(promises);
});

check_gridlines.addEventListener("change", (evt) => {
  let checked = evt.target.checked; //checked means hide it
  let all_grid = document.querySelectorAll(".grid-column");
  if (checked) {
    all_grid.forEach((grid) => grid.classList.add("hide-grid"));
  } else {
    all_grid.forEach((grid) => grid.classList.remove("hide-grid"));
  }

  //This is relevant for CAMERA mode

  if (checked) {
    arucoCanvasOutputGrid.setAttribute("hide-grid", true);
  } else {
    arucoCanvasOutputGrid.removeAttribute("hide-grid");
  }
});

//------------------------Bot policy checkbox handlers----------------------------------------//
random_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  let parent = evt.target.parentNode;
  if (checked) {
    parent.classList.remove("policy-inactive");
  } else {
    parent.classList.add("policy-inactive");
  }
});
follow_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  let parent = evt.target.parentNode;
  if (checked) {
    parent.classList.remove("policy-inactive");
  } else {
    parent.classList.add("policy-inactive");
  }
});
run_away_from_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  let parent = evt.target.parentNode;
  if (checked) {
    parent.classList.remove("policy-inactive");
  } else {
    parent.classList.add("policy-inactive");
  }
});
collect_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  // TODO: Only do this for the current user's bot_id
  for (let bot_id in grid.bots) {
    console.log("Updating policy");
    grid.update_bot_policy(bot_id, "COLLECT", checked);
  }
  let parent = evt.target.parentNode;
  if (checked) {
    parent.classList.remove("policy-inactive");
  } else {
    parent.classList.add("policy-inactive");
  }
});

//---------------------------Bot policy select handlers-------------------------------------//
collect_select.addEventListener("change", (evt) => {
  let type = evt.target.value;
  let bot_id = 1; //TODO: Change this to the bot_id for this user
  grid.update_bot_collect(bot_id, type);
});
