import { setupDraggable, setupGridDropzone } from "./test-interact.js";

//to know the selected theme and change the background accordingly
var body = document.getElementById("body");
var urlParams = new URLSearchParams(window.location.search);
var selectedOption = urlParams.get("option");
window.selectedOption = selectedOption;
var selectedMode = urlParams.get("mode");
let tutorial = urlParams.get("tutorial");
let is_tutor = urlParams.get("is_tutor") === true;
if (tutorial && !is_tutor) {
  body.setAttribute("tutorial", tutorial);
  currentBotId = Number(urlParams.get("bot_id")); //If tutorial the bot's id will be provided
}
body.setAttribute("current-mode", selectedMode);
body.setAttribute("current-option", selectedOption);
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
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
let grid;

// TODO: This info should depende on how good it'll look in the screen
let rows; //16; //was 10
let cols; //16; //was 20
let cell_size; //40; //was 60
if (selectedMode === "virtual") {
  rows = 16;
  cols = 16;
  cell_size = 40;
} else {
  rows = 20;
  cols = 20;
  cell_size = 32;
}
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
const COIN_IMAGES = {
  [COIN_COLLECT_TYPES.COIN]: ASSETS_FOLDER + "None_Coin.png",
  [COIN_COLLECT_TYPES.PIZZA]: ASSETS_FOLDER + "DB_Pizza_1.png",
  [COIN_COLLECT_TYPES.COFFEE]: ASSETS_FOLDER + "DB_Coffee_1.png",
  [COIN_COLLECT_TYPES.STAR]: ASSETS_FOLDER + "Star_1.png",
  [COIN_COLLECT_TYPES.CHERRY]: ASSETS_FOLDER + "DB_PacmanCherry_1.png",
  [COIN_COLLECT_TYPES.FOOD]: ASSETS_FOLDER + "DB_PacmanFood_1.png",
};
window.COIN_COLLECT_TYPES = COIN_COLLECT_TYPES;
window.COIN_IMAGES = COIN_IMAGES;
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
    image: ASSETS_FOLDER + "DB_Robot_3_smaller.png",
    width: 3, //1.9,
    height: 3,
    type: BOT_TYPE,
    relative_anchor: [1, 1],
    theme: "None",
  },
  building: {
    image: ASSETS_FOLDER + "None_Building.png",
    template_rotate_90: "building_rotate_90",
    width: 3, //1.1,
    height: 1,
    type: OBSTACLE_TYPE,
    theme: "None",
    template_cell_size: 30,
  },
  building_rotate_90: {
    image: ASSETS_FOLDER + "None_Building_rotate_90.png",
    width: 1, //1.1,
    height: 3,
    type: OBSTACLE_TYPE,
    theme: "None",
    template_cell_size: 30,
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
    width: 2, //1.3,
    height: 1,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  car_2: {
    image: ASSETS_FOLDER + "DB_Car_2.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_2_rotate_90.png",
    width: 2, //1.3,
    height: 1,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  car_3: {
    image: ASSETS_FOLDER + "DB_Car_3.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_3_rotate_90.png",
    width: 2, //1.3,
    height: 1,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
    template_cell_size: 40,
  },
  truck_1: {
    image: ASSETS_FOLDER + "DB_Truck_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Truck_1_rotate_90.png",
    width: 2, //1.3,
    height: 1,
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
    template_rotate_90: "river_rotate_90",
    width: 2,
    height: 1,
    type: OBSTACLE_TYPE,
    theme: "City",
    template_cell_size: 40,
  },
  river_rotate_90: {
    image: ASSETS_FOLDER + "DB_River_1_rotate_90.png",
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
    image: ASSETS_FOLDER + "DB_PacmanWall_1_filled.png",
    template_rotate_90: "pacman_wall_rotate_90",
    width: 3, //0.7,
    height: 1,
    type: OBSTACLE_TYPE,
    theme: "Pacman",
  },
  pacman_wall_rotate_90: {
    image: ASSETS_FOLDER + "DB_PacmanWall_1_filled_rotate_90.png",
    width: 1, //0.7,
    height: 3,
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
    width: 2, //1.5,
    height: 1, //1.5,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "School",
    template_cell_size: 40,
  },
  school_bus: {
    image: ASSETS_FOLDER + "DB_SchoolBus_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_SchoolBus_1_rotate_90.png",
    width: 3, //1.5,
    height: 1, //1.7,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "School",
    template_cell_size: 30,
  },
  brickwall: {
    image: ASSETS_FOLDER + "DB_Brickwall_1.png",
    template_rotate_90: "brickwall_rotate_90",
    width: 2, //1.5,
    height: 1, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 30,
  },
  brickwall_rotate_90: {
    image: ASSETS_FOLDER + "DB_Brickwall_1_rotate_90.png",
    width: 1, //1.5,
    height: 2, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 30,
  },
  building_roof_1: {
    image: ASSETS_FOLDER + "DB_BuildingRoof_1.png",
    width: 4, //1.5,
    height: 4, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 20,
  },
  building_roof_2: {
    image: ASSETS_FOLDER + "DB_BuildingRoof_2.png",
    template_rotate_90: "building_roof_2_rotate_90",
    width: 4, //1.5,
    height: 2, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 20,
  },
  building_roof_2_rotate_90: {
    image: ASSETS_FOLDER + "DB_BuildingRoof_2_rotate_90.png",
    width: 2, //1.5,
    height: 4, //1.7,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 20,
  },
  hedge: {
    image: ASSETS_FOLDER + "DB_Hedge_1.png",
    template_rotate_90: "hedge_rotate_90",
    width: 3, //0.7,
    height: 1,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 30,
  },
  hedge_rotate_90: {
    image: ASSETS_FOLDER + "DB_Hedge_1_rotate_90.png",
    width: 1, //0.7,
    height: 3,
    type: OBSTACLE_TYPE,
    theme: "School",
    template_cell_size: 30,
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

const TEMPLATES_PER_THEME = {
  None: {
    bots: [
      "doodlebot_alone",
      "doodlebot_cowboy",
      // "robot_1",
      // "robot_2",
      // "robot_3",
    ],
    obstacles: [
      "building",
      "building_rotate_90",
      "river",
      "river_rotate_90",
      "brickwall",
      "brickwall_rotate_90",
    ],
    coins: ["coin", "star"],
  },
  City: {
    // bots: ["car_1", "car_2", "car_3", "truck_1"],
    bots: ["robot_1", "robot_2", "robot_3"],
    obstacles: [
      "building",
      "building_rotate_90",
      "river",
      "river_rotate_90",
      "bush",
    ],
    coins: ["pizza", "coffee"],
  },
  Pacman: {
    bots: ["pacman", "ghost_pink", "ghost_blue", "ghost_orange", "ghost_red"],
    obstacles: ["pacman_wall", "pacman_wall_rotate_90"],
    coins: ["pacman_cherry", "pacman_food"],
  },
  School: {
    // bots: ["bicycle", "school_bus"],
    bots: [
      "doodlebot_alone",
      "doodlebot_cowboy",
      "robot_1",
      "robot_2",
      "robot_3",
    ],
    obstacles: [
      "building_roof_1",
      "building_roof_2",
      "hedge",
      "hedge_rotate_90",
      "brickwall",
      "brickwall_rotate_90",
    ],
    coins: ["coffee_school", "pizza_school", "coin_school"],
  },
  // Just in case
  Defautt: {
    bots: [
      "doodlebot_alone",
      "doodlebot_cowboy",
      "robot_1",
      "robot_2",
      "robot_3",
    ],
    obstacles: ["building"],
    coins: ["coin", "star"],
  },
};
let waitingToStartModalHandler = new bootstrap.Modal(waitingToStartModal);
window.waitingToStartModalHandler = waitingToStartModalHandler;

let scoreModalHandler = new bootstrap.Modal(scoreModal);
let continueModalHandler = new bootstrap.Modal(continueModal);
let needToSelectMovementHandler = new bootstrap.Modal(
  needToSelectMovementModal
);

continueToNextPage.addEventListener("click", () => {
  scoreModalHandler.hide();
  continueModalHandler.show();
  live_updates.finish_page({ roomId: roomId, page: tutorial });
});
const showWaitModal = () => {
  waitingToStartModalHandler.show();
};
const hideWaitModal = () => {
  waitingToStartModalHandler.hide();
};
window.hideWaitModal = hideWaitModal;
window.showWaitModal = showWaitModal;

cancelReadyToWait.addEventListener("click", () => {
  hideWaitModal();
  let bot = grid.update_ready_to_start(currentBotId, false);
  live_updates.replace_bot_ready_to_start({
    bot,
    virtualGrid: grid.toJSON(),
  });
});
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
  gridContainer.style.resize = "contain";

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
      "url(../assets/DB_SchoolGridBG_2_640x640.png)";
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
  imageEl.setAttribute("type", "bot");
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
  imageEl.setAttribute("type", "obstacle");
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
  imageEl.setAttribute("type", "coin");
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
/**
 * Uses the info from MOVEMENT_VALUES to add them as options to distance type select
 */
const setupSelectOptions = () => {
  Object.keys(MOVEMENT_VALUES).map((key) => {
    let { value, text } = MOVEMENT_VALUES[key];
    let option = document.createElement("option");
    option.setAttribute("value", value);
    if (value === MOVEMENT_VALUES.DIJKSTRA.value) {
      option.setAttribute("hidden", ""); //Don't allow by default
    }
    option.innerText = text;
    movementTypeSelect.appendChild(option);
  });
};
const onChangeRequireGraph = () => {
  let is_moving = body.getAttribute("is-moving") === "true";
  if (is_moving) {
    //While is moving don't change anything
    return;
  }
  changeMovingBotsButton.disabled = !grid.is_ready_to_start();

  let current_needs = grid.requires_graph_load.includes(currentBotId);
  if (current_needs) {
    loadBotButton.innerHTML = "Load bot info!";
    loadBotButton.disabled = false;
  } else {
    loadBotButton.innerHTML = "Loaded!";
    loadBotButton.disabled = true;
  }
};
const TEMPLATE_GRIDS = {
  game1: {
    grid: {
      bots: {
        1: {
          angle: 0,
          height: 3,
          width: 1,
          image: "../assets/None_DoodleBot.png",
          movement_type: MOVEMENT_VALUES.RANDOM.value,
          policies: [BOT_POLICIES.COLLECT.value],
          real_bottom_left: [2, 12],
          relative_anchor: [1, 1],
          targets: [COIN_COLLECT_TYPES.COIN],
        },
        2: {
          angle: 0,
          height: 3,
          width: 1,
          image: "../assets/None_DoodleBot.png",
          movement_type: MOVEMENT_VALUES.RANDOM.value,
          policies: [BOT_POLICIES.COLLECT.value],
          real_bottom_left: [2, 12],
          relative_anchor: [1, 1],
          targets: [COIN_COLLECT_TYPES.COIN],
        },
      },
    },
  },
};
const disableBotChoices = () => {
  let checkboxes = botUpdateSelector.querySelectorAll("input[type='checkbox']");
  for (let checkbox of checkboxes) {
    checkbox.disabled = true;
    // checkbox.parentNode.classList.add("policy-inactive"); //To not show select
  }
  let selected = botUpdateSelector.querySelectorAll("select");
  for (let select_box of selected) {
    select_box.disabled = true;
  }
};
const setupTutorialGrid = () => {
  //-------------------- Step 1: Create the coins--------------------------------------------//
  let coin_positions = [
    [1, 1],
    [2, 4],
    [4, 8],
    [7, 4],
    [8, 4],
    [11, 8],
    [13, 4],
    [14, 1],
  ];
  let start_id = 20;
  let coin_template_mapping = {
    None: "coin",
    City: "pizza",
    School: "coffee",
    Pacman: "pacman_cherry",
  };
  let coin_template_id = coin_template_mapping[selectedOption];
  for (let [x, y] of coin_positions) {
    let coin = {
      ...ALL_ASSETS[coin_template_id],
      real_bottom_left: [x, y],
      template_id: coin_template_id,
      id: start_id,
    };
    start_id += 1;
    grid.replace_coin(coin.id, coin, { is_new: true });
  }
  //-------------------- Step 1: Create the bots that collect the coins -------------------------------------//
  let movement_type_mapping = {
    game1: MOVEMENT_VALUES.RANDOM.value,
    game2: MOVEMENT_VALUES.EUCLIDEAN.value,
    game3: MOVEMENT_VALUES.MANHATTAN.value,
    game4: MOVEMENT_VALUES.DIJKSTRA.value,
  };
  let movement_type = movement_type_mapping[tutorial];

  let bots = [
    { id: 1, real_bottom_left: [1, 12], angle: 0 },
    { id: 2, real_bottom_left: [12, 12], angle: 180 },
  ];
  for (let bot_info of bots) {
    let template_id = OBJECT_SIZES[bot_info.id].templates[selectedOption];
    let bot = {
      ...ALL_ASSETS[template_id],
      ...bot_info,
      template_id,
    };
    let res = grid.replace_bot(bot.id, bot, { is_new: true }); //Pretend it came from somewhere else

    grid.update_bot_policy(bot.id, "COLLECT", true); //Activate selected
    let collect_type = ALL_ASSETS[coin_template_id].coin_collect_type;
    grid.update_bot_collect(bot.id, collect_type);

    if (bot.id === currentBotId) {
      // Make options appear
      setupSelectedBot(res);
      // Show options in the grid
      collect_checkbox.checked = true;
      collect_checkbox.parentNode.classList.remove("policy-inactive"); //To show the select
      collect_select.value = collect_type;

      grid.update_bot_movement_type(currentBotId, movement_type);
      movementTypeSelect.value = movement_type;
      if (movement_type === MOVEMENT_VALUES.DIJKSTRA.value) {
        body.setAttribute("needs-loading", "");
      } else {
        body.removeAttribute("needs-loading");
      }
    }
  }
  let obstacle_template_mapping = {
    None: "building",
    City: "hedge",
    School: "hedge",
    Pacman: "pacman_wall",
  };
  let obstacles = [
    { id: 11, real_bottom_left: [2, 9] },
    { id: 12, real_bottom_left: [11, 9] },
  ];
  if (tutorial === "game3" || tutorial === "game4") {
    for (let obstacle_info of obstacles) {
      let obstacle_template_id = obstacle_template_mapping[selectedOption];

      let obstacle = {
        ...ALL_ASSETS[obstacle_template_id],
        ...obstacle_info,
        template_id: obstacle_template_id,
      };
      let res = grid.replace_obstacle(obstacle.id, obstacle, { is_new: true }); //Pretend it came from somewhere else
    }
  }

  disableBotChoices();
};
const setupGridFromPrevious = (prevGrid = {}) => {
  grid = new VirtualGrid(rows, cols, {
    ...prevGrid,
    onAddBot,
    onAddObstacle,
    onAddCoin,
    // onPickupCoin,
    // onUpdateBot,
    // onUpdateObstacle,
    // onUpdateCoin,
    onRemoveBot,
    onRemoveObstacle,
    onRemoveCoin,
    onReplaceBot,
    onReplaceObstacle,
    onReplaceCoin,
    onChangeRequireGraph,
    // onApplyMoveToBot,
  });
  window.grid = grid;
  let { bots, obstacles, coins } = TEMPLATES_PER_THEME[selectedOption];
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
    //In template disabled interactivity
    if (!tutorial) {
      setupDraggable(".template", cell_size); //Make all templates draggable
      setupGridDropzone(cell_size); // To style the grid when an object can be dropped
    } else {
      //IF it's tutorial: Setup the bots
      setupTutorialGrid();
    }
  }
};
window.setupGridFromPrevious = setupGridFromPrevious;
document.addEventListener("DOMContentLoaded", () => {
  setupSelectOptions();
  if (selectedMode === "virtual") {
    createDOMGrid(rows, cols, cell_size);
  } else {
    canvasContainer.style.width = `${cell_size * cols}px`;
    canvasContainer.style.height = `${cell_size * rows}px`;

    videoObj.setAttribute("width", cell_size * cols);
    videoObj.setAttribute("height", cell_size * rows);

    image_from_stream.setAttribute("width", cell_size * cols);
    image_from_stream.setAttribute("height", cell_size * rows);
  }

  setupGridFromPrevious({});
});
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
const onReplaceBot = (bot_id, bot, options = {}) => {
  // console.log("onReplaceBot");
  let { is_new } = options;
  if (!options.fromSocket && !tutorial) {
    emitReplaceBot(bot);
  }

  //If it's not new, then delete traces of the previous image
  if (!is_new) {
    let DOM_ID = `${BOT_TYPE}-${bot_id}`;
    let div = document.getElementById(DOM_ID);
    div.remove(); //Not needed anymore, but paint the object again
    if (selectedMode === "camera") {
      //Also remove the template as it'll get created again
      let template = document.getElementById(getAssetTemplate(bot_id));
      template.remove();
    }
  }
  setupNewBot(bot);
  // When camera mode, the currentBotId will be decided first
  // If it's the same, create the select
  if (is_new && selectedMode === "camera" && bot_id === currentBotId) {
    setupSelectedBot(bot);
  }
  //If it's changed dont reset it
  if (!options.changed_ready_start) {
    grid.reset_default_require_graph();
  }
  // if (tutorial && tutorial !== "game4") {
  //   // Came from creating an object
  // }
};

const onReplaceObstacle = (obstacle_id, obstacle, options = {}) => {
  let { is_new } = options;
  if (!options.fromSocket && !tutorial) {
    emitReplaceObstacle(obstacle);
  }
  //If it's not new, then delete traces of the previous image
  if (!is_new) {
    let DOM_ID = `${OBSTACLE_TYPE}-${obstacle_id}`;
    let div = document.getElementById(DOM_ID);
    div.remove(); //Not needed anymore, but paint the object again
    if (selectedMode === "camera") {
      //Also remove the template as it'll get created again
      let template = document.getElementById(getAssetTemplate(obstacle_id));
      template.remove();
    }
  }
  setupNewObstacle(obstacle);
  grid.reset_default_require_graph();
};
const onReplaceCoin = (coin_id, coin, options = {}) => {
  let { is_new } = options;
  if (!options.fromSocket && !tutorial) {
    emitReplaceCoin(coin);
  }
  //If it's not new, then delete traces of the previous image
  if (!is_new) {
    let DOM_ID = `${COIN_TYPE}-${coin_id}`;
    let div = document.getElementById(DOM_ID);
    div.remove(); //Not needed anymore, but paint the object again
    if (selectedMode === "camera") {
      //Also remove the template as it'll get created again
      let template = document.getElementById(getAssetTemplate(coin_id));
      template.remove();
    }
  }
  setupNewCoin(coin);
  grid.reset_default_require_graph();
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
  rotateArrow.classList.add("edit-icon");
  rotateArrow.addEventListener("click", () => {
    console.log("Tyring to turn 90");
    let move = ["turn", 90];
    let res = grid.apply_next_move_to_bot(bot.id, move);
    if (res.success) {
      emitReplaceBot(res.bot);
    }
  });
  bot_dom.appendChild(rotateArrow);
};

const addRemoveBotIcon = (bot) => {
  let DOM_ID = `${BOT_TYPE}-${bot.id}`;
  let bot_dom = document.getElementById(DOM_ID);
  let removeIcon = document.createElement("div");
  removeIcon.innerText = "🗑️";
  removeIcon.classList.add("delete-icon");
  removeIcon.classList.add("edit-icon");
  removeIcon.addEventListener("click", () => {
    console.log(`Removing bot with id ${bot.id}`);
    // If clicking the removing bot, then unset
    grid.remove_bot(bot.id);
    let bots_container = document.getElementById("bots");
    document.body.removeAttribute("chosen-bot");
    selectedBotMessage.innerText = `Select a bot`;
    for (let template of bots_container.children) {
      template.removeAttribute("chosen-bot");
    }
    currentBotId = null;
    resetBotChoices();
    live_updates.remove_bot({ bot, virtualGrid: grid.toJSON() });
  });
  bot_dom.appendChild(removeIcon);
};
const addRemoveObstacleIcon = (obstacle) => {
  let DOM_ID = `${OBSTACLE_TYPE}-${obstacle.id}`;
  let obstacle_dom = document.getElementById(DOM_ID);
  let removeIcon = document.createElement("div");
  removeIcon.innerText = "🗑️";
  removeIcon.classList.add("delete-icon");
  removeIcon.classList.add("edit-icon");
  removeIcon.addEventListener("click", () => {
    console.log(`Removing obstacle with id ${obstacle.id}`);
    grid.remove_obstacle(obstacle.id);
    live_updates.remove_obstacle({ obstacle, virtualGrid: grid.toJSON() });
  });
  obstacle_dom.appendChild(removeIcon);
};
const addRemoveCoinIcon = (coin) => {
  let DOM_ID = `${COIN_TYPE}-${coin.id}`;
  let coin_dom = document.getElementById(DOM_ID);
  let removeIcon = document.createElement("div");
  removeIcon.innerText = "🗑️";
  removeIcon.classList.add("delete-icon");
  removeIcon.classList.add("edit-icon");
  removeIcon.addEventListener("click", () => {
    console.log(`Removing obstacle with id ${coin.id}`);
    grid.remove_coin(coin.id);
    live_updates.remove_coin({ coin, virtualGrid: grid.toJSON() });
  });
  coin_dom.appendChild(removeIcon);
};
/**
 * Unchecks all checkboxes left behind from previous (removed) bot
 */
const resetBotChoices = () => {
  let checkboxes = botUpdateSelector.querySelectorAll("input[type='checkbox']");
  for (let checkbox of checkboxes) {
    checkbox.checked = false;
    checkbox.parentNode.classList.add("policy-inactive"); //To not show select
  }
  let selected = botUpdateSelector.querySelectorAll("select");
  for (let select_box of selected) {
    select_box.selectedIndex = 0;
  }
};
const onRemoveBot = (bot) => {
  // Remove the bot from the grid
  let DOM_ID = `${BOT_TYPE}-${bot.id}`;
  let bot_dom = document.getElementById(DOM_ID);
  bot_dom.remove();
  grid.reset_default_require_graph();

  /** Removes removed bot from being followed/follow */
  let folow_bot_select = follow_select.querySelector(`[value="${bot.id}"]`);
  if (folow_bot_select) {
    //Already exists, don't add it
    folow_bot_select.remove();
  }
  let run_away_bot_select = run_away_from_select.querySelector(
    `[value="${bot.id}"]`
  );
  if (run_away_bot_select) {
    run_away_bot_select.remove();
  }
};
const onRemoveObstacle = (obstacle) => {
  // Remove the obstacle from the grid
  let DOM_ID = `${OBSTACLE_TYPE}-${obstacle.id}`;
  let obstacle_dom = document.getElementById(DOM_ID);
  obstacle_dom.remove();
  grid.reset_default_require_graph();
};
const onRemoveCoin = (coin, options) => {
  // Remove the coin from the grid
  let DOM_ID = `${COIN_TYPE}-${coin.id}`;
  let coin_dom = document.getElementById(DOM_ID);
  coin_dom.remove();
  if (!options.fromSocket) {
    live_updates.remove_coin({ coin, virtualGrid: grid.toJSON() });
  }
  grid.reset_default_require_graph();
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
    template_id,
    real_bottom_left: [i, j],
    angle,
  } = bot;

  //Creating a div at the given position
  let bot_dom = document.createElement("div");
  let DOM_ID = `${BOT_TYPE}-${bot.id}`;
  if (bot.id === currentBotId) {
    bot_dom.classList.add("current-bot");
    bot_dom.setAttribute("chosen-bot", "");
  }
  bot_dom.classList.add("bot-container");
  bot_dom.classList.add("grab");
  bot_dom.setAttribute("id", DOM_ID);
  bot_dom.setAttribute("grid_object", "true");
  bot_dom.setAttribute("type", "bot");
  bot_dom.style.left = `${cell_size * i}px`;
  bot_dom.style.bottom = `${cell_size * j}px`;
  bot_dom.style.touchAction = "none";
  bot_dom.setAttribute("angle", bot.angle);

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
const getImageFromDimensions = (width, height, template_id) => {
  // console.log(`Findgin info for template ${template_id}`);
  let original_template = ALL_ASSETS[template_id];
  let template_width = original_template.width;
  let template_height = original_template.height;
  if (width >= height === template_width >= template_height) {
    return original_template.image;
  } else {
    //Should be the rotate_90
    let { template_rotate_90 } = original_template;
    return ALL_ASSETS[template_rotate_90].image;
  }
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
    template_id,
  } = obstacle;

  //Creating a div at the given position
  let obstacle_dom = document.createElement("div");
  let DOM_ID = `${OBSTACLE_TYPE}-${obstacle.id}`;
  obstacle_dom.classList.add("obstacle-container");
  obstacle_dom.classList.add("grab");
  obstacle_dom.setAttribute("id", DOM_ID);
  obstacle_dom.setAttribute("type", "obstacle");
  obstacle_dom.setAttribute("grid_object", "true");
  obstacle_dom.style.left = `${cell_size * i}px`;
  obstacle_dom.style.bottom = `${cell_size * j}px`;
  obstacle_dom.style.touchAction = "none";

  // Creates the underlying image, with the given dimensions and orientation
  let imageEl = document.createElement("img");
  imageEl.classList.add("obstacle-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  //The images by default will have a longer height than width
  imageEl.setAttribute(
    "src",
    getImageFromDimensions(width, height, template_id)
  );
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
    template_id,
  } = coin;

  //Creating a div at the given position
  let coin_dom = document.createElement("div");
  let DOM_ID = `${COIN_TYPE}-${coin.id}`;
  coin_dom.classList.add("coin-container");
  coin_dom.classList.add("grab");
  coin_dom.setAttribute("id", DOM_ID);
  coin_dom.setAttribute("grid_object", "true");
  coin_dom.setAttribute("type", "coin");
  coin_dom.style.left = `${cell_size * i}px`;
  coin_dom.style.bottom = `${cell_size * j}px`;
  coin_dom.style.touchAction = "none";

  // Creates the underlying image, with the given dimensions and orientation
  let imageEl = document.createElement("img");
  imageEl.classList.add("coin-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  //The images by default will have a longer height than width
  imageEl.setAttribute(
    "src",
    getImageFromDimensions(width, height, template_id)
  );
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
  return OBJECT_SIZES[aruco_id].templates[selectedOption];
};
/**
 * A bot has been created on the VirtualGrid system. This method:
 * 1. Creates the image in the grid at the necessary position
 * 2. Makes the created image draggable
 */
const setupNewBot = (bot) => {
  let DOM_ID = drawBot(bot);

  if (selectedMode === "virtual") {
    if (bot.id === currentBotId && !tutorial) {
      //Makes the created div draggable
      addRotateBotIcon(bot);
      addRemoveBotIcon(bot);
    }
    if (!tutorial) {
      setupDraggable(`#${DOM_ID}`, cell_size);
    }
  } else {
    addBotTemplate(getAssetTemplate(bot.id));
  }

  addBotToFollowSelect(bot);
  addBotToRunFromSelect(bot);
};
const setupSelectedBot = (bot) => {
  if (bot.id !== currentBotId) {
    console.warn(
      `[setupSelectedBot] the id of the selected bot (${bot.id}) should be the same as the currentBotId (${currentBotId})`
    );
  }
  let bots_container = document.getElementById("bots");
  document.body.setAttribute("chosen-bot", currentBotId);
  selectedBotMessage.innerText = `You are bot #${currentBotId}`;
  for (let template of bots_container.children) {
    if (template.getAttribute("template_id") === bot.template_id) {
      // Mark it as selected bot
      template.setAttribute("chosen-bot", "");
    }
  }
};
/**
 * Assumes that this will only be called for currentBotId
 * @param {*} bot
 */
const onAddBot = (bot) => {
  if (selectedMode === "virtual") {
    setupSelectedBot(bot);
  }
  live_updates.add_bot({ bot, virtualGrid: grid.toJSON() });
  grid.reset_default_require_graph();
  setupNewBot(bot);
};
const addBotToFollowSelect = (bot) => {
  if (follow_select.querySelector(`[value="${bot.id}"]`)) {
    //Already exists, don't add it
    return;
  }
  if (Number(currentBotId) === Number(bot.id)) {
    //Don't add itself as a target
    return;
  }
  let option = document.createElement("option");
  option.setAttribute("value", bot.id);
  option.innerText = `Bot ${bot.id}`;
  follow_select.appendChild(option);
};
const addBotToRunFromSelect = (bot) => {
  if (run_away_from_select.querySelector(`[value="${bot.id}"]`)) {
    //Already exists, don't add it
    return;
  }
  if (Number(currentBotId) === Number(bot.id)) {
    //Don't add itself as a run away from
    return;
  }
  let option = document.createElement("option");
  option.setAttribute("value", bot.id);
  option.innerText = `Bot ${bot.id}`;
  run_away_from_select.appendChild(option);
};
/**
 * Pretty much the same as `onAddBot`, just that here we don't need a 'turn' icon
 *
 * @param {*} obstacle
 */
const setupNewObstacle = (obstacle) => {
  let DOM_ID = drawObstacle(obstacle);
  if (selectedMode === "virtual") {
    //Makes the created div draggable
    if (!tutorial) {
      addRemoveObstacleIcon(obstacle);
      setupDraggable(`#${DOM_ID}`, cell_size);
    }
  } else {
    addObstacleTemplate(getAssetTemplate(obstacle.id));
  }
};
const onAddObstacle = (obstacle) => {
  live_updates.add_obstacle({ obstacle, virtualGrid: grid.toJSON() });
  grid.reset_default_require_graph();
  setupNewObstacle(obstacle);
};
/**
 * Pretty much the same as `onAddBot`, just that here we don't need a 'turn' icon
 *
 * @param {*} obstacle
 */
const setupNewCoin = (coin) => {
  let DOM_ID = drawCoin(coin);
  if (selectedMode === "virtual") {
    //Makes the created div draggable
    if (!tutorial) {
      addRemoveCoinIcon(coin);
      setupDraggable(`#${DOM_ID}`, cell_size);
    }
  } else {
    addCoinTemplate(getAssetTemplate(coin.id));
  }

  addCoinTypeToSelect(coin);
};
const onAddCoin = (coin) => {
  live_updates.add_coin({ coin, virtualGrid: grid.toJSON() });
  grid.reset_default_require_graph();
  setupNewCoin(coin);
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
let is_bot_moving = false;
let intervals = {}; //bot_id -> interval
scoreModalClose.addEventListener("click", () => {
  scoreModalHandler.hide();
});
/**
 * If the bot is moving, it will stop (and vice versa)
 *
 * @param {*} bot_id
 * @param {*} evt
 */
async function stopMovingBot(bot_id) {
  body.removeAttribute("is-moving");
  //Stop
  console.log("stopping...");
  document.getElementById("controls").style.visibility = "visible";
  document.getElementById("objects").style.visibility = "visible";
  document.getElementById("mySidebar").style.width = "500px";
  document.getElementById("main").style.marginLeft = "500px";
  //Changing button style
  changeMovingBotsButton.innerHTML = "Start moving";
  changeMovingBotsButton.classList.remove("bot-stop");
  changeMovingBotsButton.classList.add("bot-start");

  let bot = grid.bots[bot_id][0];
  if (!is_bot_moving) {
    console.log("Tried to stop bot but it's already not moving!");
    return;
  }
  is_bot_moving = false;
  if (selectedMode === "camera") {
    // await stopMovingBot_camera(currentBotId);
    // TODO: Check if need to do anything here
  } else {
    stopMovingBot_virtual(bot_id);
  }
  grid.reset_default_require_graph();
}
let countdown_interval;
let seconds_left;
let SECONDS_PER_MINUTE = 60;
const updateScoresInModal = () => {
  let message = "";
  for (let bot_id in grid.bots) {
    let is_self = Number(currentBotId) === Number(bot_id);
    let bot = grid.bots[bot_id][0];

    let count_target = 0;
    let coin_target = bot.targets[0];
    let coin_image = COIN_IMAGES[coin_target];
    for (let coin of bot.coins) {
      if (coin_target === coin.coin_collect_type) {
        count_target += 1;
      }
    }
    // let html_count = "";
    // for (let [coin_image, coin_count] of Object.entries(collected)) {
    // }
    let bot_html = `<div style="font-size:24px"><image width="60px" height="60px" alt="img" src="${bot.image}"> `;

    bot_html += `collected ${count_target} <image width="40px" height="40px" alt="img" src="${coin_image}">`;
    if (is_self) {
      bot_html += " (You) ";
    }
    bot_html += `<br><br>\n</div>`;
    message += bot_html;
    // message += "<br>NEW TEST: " + bot.coins + "<br>END OF NEW TEST<br>";
    // for (let test in bot.coins) {
    //   message += "<br>NEW TEST: " + test + "<br>END OF NEW TEST<br>";
    // }
    // message += `<br>TEST<br><image width="20px" height="20px" alt="img" src="${bot.image}">  `;
  }
  // scoreModalBody.innerHTML = "test/" + bot + "/test";

  scoreModalBody.innerHTML = message;
};
/**
 * If the bot is moving, it will stop (and vice versa)
 *
 * @param {*} bot_id
 * @param {*} evt
 */
async function startMovingBot(bot_id) {
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("controls").style.visibility = "hidden";
  document.getElementById("objects").style.visibility = "hidden";
  document.getElementById("main").style.marginLeft = "250px";
  body.setAttribute("is-moving", "true");
  if (tutorial) {
    //Start counter!
    seconds_left = tutorial === "game1" ? 30 : 15; //Give more time for random to pickup something
    countdown_interval = setInterval(() => {
      let m = Math.floor(seconds_left / SECONDS_PER_MINUTE);
      let s = seconds_left % SECONDS_PER_MINUTE;
      m = m.toString().padStart(2, "0");
      s = s.toString().padStart(2, "0");
      countdown.style.display = "block";
      countdown.innerText = `${m}:${s}`;
      if (seconds_left === 0) {
        clearInterval(countdown_interval);
        grid.reset_ready_to_start();
        stopMovingBot(currentBotId);
        updateScoresInModal();
        scoreModalHandler.show();
      }
      seconds_left -= 1;
    }, 1000);
  }

  //Setting up the graphs for the bots. This could take a while
  changeMovingBotsButton.innerHTML = "Stop moving";
  changeMovingBotsButton.classList.remove("bot-start");
  changeMovingBotsButton.classList.add("bot-stop");

  if (is_bot_moving) {
    console.log("Tried to start bot but already started!");
    return;
  }
  //Start
  is_bot_moving = true;

  if (!is_tutor) {
    if (selectedMode === "camera") {
      if (!cameraController.is_own_camera) {
        frames_without_aligning = 0;
        await startMovingBot_camera(bot_id);
      }
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
let frames_without_aligning = 0;
let FRAMES_TO_ALIGN = 10 * 30;

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
  if (is_bot_moving) {
    //TODO: This info should be stored in the grid object
    // let num_turns = Number(
    //   document.getElementById(`coins-policy-turns-${bot_id}`).value
    // );
    let num_turns = 1; //TODO: Add this as an option?
    let next_move = grid.get_next_move_using_policies(bot_id, num_turns);

    if (next_move) {
      if (frames_without_aligning % FRAMES_TO_ALIGN === 0) {
        await adjustAngleRealBot(bot_id);
      }
      await realBot.apply_next_move_to_bot(next_move);
      frames_without_aligning += 1;
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
    await sleep(1000); //wait for it to finish
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
    let { bot } = grid.apply_next_move_to_bot(bot_id, next_move);
    emitReplaceBot(bot);
  }
  intervals[bot_id] = setInterval(move, 500);
}
/** Stops bot by deleting the interval for the bot */
function stopMovingBot_virtual(bot_id) {
  clearInterval(intervals[bot_id]);
  delete intervals[bot_id];
}
/**Gets called when the button gets pressed */
const changeMovingBotsHandler = async (options = {}) => {
  //This decides to hide the controls, and make sure the grid is not interactive
  let was_moving = body.getAttribute("is-moving") === "true";
  if (was_moving) {
    live_updates.stop_moving({});
    // await stopMovingBot(currentBotId, options);
    grid.reset_default_require_graph();
    body.removeAttribute("is-waiting-for-users");
  } else {
    let bot = grid.update_ready_to_start(currentBotId, true);
    live_updates.replace_bot_ready_to_start({
      bot,
      virtualGrid: grid.toJSON(),
    });
    body.setAttribute("is-waiting-for-users", "");
    body.removeAttribute("show-other-user-ready");
    // Check if everyone is ready to start
    if (grid.is_everyone_ready_to_start()) {
      live_updates.everyone_ready_to_start({});
    } else {
      showWaitModal();
    }
  }
};
cancelNeedMovementButton.addEventListener("click", () => {
  console.log("clicked cancel!");
  needToSelectMovementHandler.hide();
});
changeMovingBotsButton.addEventListener("click", async () => {
  if (grid.bots[currentBotId][0].movement_type === null) {
    needToSelectMovementHandler.show();
    return;
  }
  await changeMovingBotsHandler();
});
loadBotButton.addEventListener("click", () => {
  //Unfortunately the html cahnges won't show until the update_all_coin_graphs is finished
  loadBotButton.innerHtml = "Loading..."; //Don't make it press twice
  loadBotButton.disabled = true; //Don't make it press twice
  grid.update_all_coin_graphs(currentBotId);
  grid.change_require_graph(currentBotId, false);
  live_updates.echange_require_graph({
    bot_id: currentBotId,
    require_graph: false,
  });
  loadBotButton.innerHTML = "Loaded!";
});
//To use later in socket handler
window.startMovingBot = startMovingBot;
window.stopMovingBot = stopMovingBot;
// window.setupBeforeStart = setupBeforeStart;
window.changeMovingBotsHandler = changeMovingBotsHandler;

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
const emitReplaceBot = (bot) => {
  live_updates.replace_bot({
    bot_id: bot.id,
    bot: bot,
    virtualGrid: grid.toJSON(),
  });
};
const emitReplaceObstacle = (obstacle) => {
  live_updates.replace_obstacle({
    obstacle_id: obstacle.id,
    obstacle: obstacle,
    virtualGrid: grid.toJSON(),
  });
};
const emitReplaceCoin = (coin) => {
  live_updates.replace_coin({
    coin_id: coin.id,
    coin: coin,
    virtualGrid: grid.toJSON(),
  });
};
window.emitReplaceBot = emitReplaceBot;
window.emitReplaceObstacle = emitReplaceObstacle;
window.emitReplaceCoin = emitReplaceCoin;

//------------------------Bot policy checkbox handlers----------------------------------------//
// random_checkbox.addEventListener("change", (evt) => {
//   let checked = evt.target.checked;
//   let parent = evt.target.parentNode;
//   if (checked) {
//     parent.classList.remove("policy-inactive");
//   } else {
//     parent.classList.add("policy-inactive");
//   }
// });
follow_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  let bot = grid.update_bot_policy(currentBotId, "FOLLOW", checked);
  emitReplaceBot(bot);
  let parent = evt.target.parentNode;
  if (checked) {
    parent.classList.remove("policy-inactive");
  } else {
    parent.classList.add("policy-inactive");
  }
  grid.reset_default_require_graph();
});
run_away_from_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  let bot = grid.update_bot_policy(currentBotId, "RUN_AWAY_FROM", checked);
  emitReplaceBot(bot);
  let parent = evt.target.parentNode;
  if (checked) {
    parent.classList.remove("policy-inactive");
  } else {
    parent.classList.add("policy-inactive");
  }
  grid.reset_default_require_graph();
});
collect_checkbox.addEventListener("change", (evt) => {
  let checked = evt.target.checked;
  let bot = grid.update_bot_policy(currentBotId, "COLLECT", checked);
  emitReplaceBot(bot);

  let parent = evt.target.parentNode;
  let dijkstraOption = movementTypeSelect.querySelector(
    `[value=${MOVEMENT_VALUES.DIJKSTRA.value}]`
  );
  console.log(dijkstraOption);
  if (checked) {
    dijkstraOption.removeAttribute("hidden");
    parent.classList.remove("policy-inactive");
  } else {
    dijkstraOption.setAttribute("hidden", "");
    parent.classList.add("policy-inactive");
  }
  grid.reset_default_require_graph();
});

//---------------------------Bot policy select handlers-------------------------------------//
collect_select.addEventListener("change", (evt) => {
  let type = evt.target.value;
  let bot = grid.update_bot_collect(currentBotId, type);
  emitReplaceBot(bot);
  grid.reset_default_require_graph();
});

follow_select.addEventListener("change", (evt) => {
  let follow_id = Number(evt.target.value);
  let bot = grid.update_bot_follow(currentBotId, follow_id);
  emitReplaceBot(bot);
  grid.reset_default_require_graph();
});

run_away_from_select.addEventListener("change", (evt) => {
  let run_away_from_id = Number(evt.target.value);
  let bot = grid.update_bot_run_away_from(currentBotId, run_away_from_id);
  emitReplaceBot(bot);
  grid.reset_default_require_graph();
});

//------------------------------ Bot distance handlers ------------------------------------//
movementTypeSelect.addEventListener("change", (evt) => {
  let value = evt.target.value;
  if (value === "None") {
    value = null;
  }
  let bot = grid.update_bot_movement_type(currentBotId, value);
  if (value === MOVEMENT_VALUES.DIJKSTRA.value) {
    body.setAttribute("needs-loading", "");
    // handleRequireGraph(true);
  } else {
    body.removeAttribute("needs-loading");
    // handleRequireGraph(false);
  }
  emitReplaceBot(bot);
  grid.reset_default_require_graph();
});
