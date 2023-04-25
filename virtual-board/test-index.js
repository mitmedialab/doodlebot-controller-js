import { setupDraggable, setupGridDropzone } from "./test-interact.js";

//to know the selected theme and change the background accordingly
var body = document.getElementById("body");
var urlParams = new URLSearchParams(window.location.search);
var selectedOption = urlParams.get("option");

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
    "background1 d-flex justify-content-center align-items-center vh-100";
} else if (selectedOption == "Pacman") {
  body.className =
    "background3 d-flex justify-content-center align-items-center vh-100";
}

//get the divs of bots, obstacles, and coins to display the images
var botsDiv = document.getElementById("bots");
var obstaclesDiv = document.getElementById("obstacles");
var coinsDiv = document.getElementById("coins");
var waitingRoom = document.getElementById("waitingRoom");

let grid;

// TODO: This info should depende on how good it'll look in the screen
var rows = 10; //was 10
var cols = 17; //was 20
var cell_size = 45; //was 60
// Just so that they become global variables
window.rows = rows;
window.cols = cols;
window.cell_size = cell_size;

let ASSETS_FOLDER = "../assets/";
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
  },
  coin: {
    image: ASSETS_FOLDER + "None_Coin.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "None",
  },
  star: {
    image: ASSETS_FOLDER + "Star_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "None",
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
  },
  car_2: {
    image: ASSETS_FOLDER + "DB_Car_2.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_2_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
  },
  car_3: {
    image: ASSETS_FOLDER + "DB_Car_3.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Car_3_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
  },
  truck_1: {
    image: ASSETS_FOLDER + "DB_Truck_1.png",
    image_rotate_90: ASSETS_FOLDER + "DB_Truck_1_rotate_90.png",
    width: 1, //1.3,
    height: 2,
    type: BOT_TYPE,
    relative_anchor: [0, 0],
    theme: "City",
  },
  bush: {
    image: ASSETS_FOLDER + "DB_Bush_1.png",
    width: 2, //1.7,
    height: 2, //1.7,
    type: OBSTACLE_TYPE,
    theme: "City",
  },
  river: {
    image: ASSETS_FOLDER + "DB_River_1.png",
    width: 1,
    height: 2,
    type: OBSTACLE_TYPE,
    theme: "City",
  },
  coffee: {
    image: ASSETS_FOLDER + "DB_Coffee_1.png",
    width: 1, //1.2,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "City",
  },
  pizza: {
    image: ASSETS_FOLDER + "DB_Pizza_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "City",
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
  },
  pacman_food: {
    image: ASSETS_FOLDER + "DB_PacmanFood_1.png",
    width: 1, //1.5,
    height: 1, //1.5,
    type: COIN_TYPE,
    theme: "Pacman",
  },
  ///////////////////////School theme//////////////////////
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

  if (selectedOption == "None") {
    gridContainer.style.backgroundImage =
      "url(../assets/None_background_cropped.png)";
  } else if (selectedOption == "City") {
    gridContainer.style.backgroundImage = "url(../assets/DB_CityGridBG_2.png)";
  } else if (selectedOption == "Pacman") {
    gridContainer.style.backgroundImage =
      "url(../assets/DB_PacmanGridBG_1.png)";
  } else if (selectedOption == "School") {
    gridContainer.style.backgroundImage =
      "url(../assets/None_background_cropped.png)";
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
/**
 * Used to create a `template` image that is draggable into the grid.
 * @param {*} template_id a valid key of ALL_ASSETS
 */
const addTemplateDiv = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  console.log("the template id is: " + template_id);
  let { image, width, height, type } = ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  imageEl.style.padding = `5px`;

  botsDiv.appendChild(imageEl);
  console.log("I will add the image now");
  waitingRoom.appendChild(imageEl);

  //add the images based on theme in their correct div --> Ive done this each in its separate function
};
/////////////////////////////////////////////////////////////////////

//Add Bots
const addBotsDiv = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  console.log("the template id is: " + template_id);
  let { image, width, height, type } = ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  imageEl.style.padding = `5px`;

  console.log("I will add the image now");
  botsDiv.appendChild(imageEl);
  // waitingRoom.appendChild(imageEl);

  //add the images based on theme in their correct div
};

const addObstaclesDiv = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  console.log("the template id is: " + template_id);
  let { image, width, height, type } = ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  imageEl.style.padding = `5px`;

  console.log("I will add the image now");
  obstaclesDiv.appendChild(imageEl);
  // waitingRoom.appendChild(imageEl);

  //add the images based on theme in their correct div
};

const addCoinsDiv = (template_id) => {
  if (!(template_id in ALL_ASSETS)) {
    console.error(`Template ${template_id} is not valid`);
    return;
  }
  console.log("the template id is: " + template_id);
  let { image, width, height, type } = ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  imageEl.style.padding = `5px`;

  console.log("I will add the image now");
  coinsDiv.appendChild(imageEl);
  // waitingRoom.appendChild(imageEl);

  //add the images based on theme in their correct div
};

document.addEventListener("DOMContentLoaded", () => {
  //   setupSocket();
  createDOMGrid(rows, cols, cell_size);
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
    obstacles = ["river", "bush"];
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
      "doodlebot_alone",
      "doodlebot_cowboy",
      "building",
      "coin",
      "star",
    ];
    bots = ["car_1", "car_2", "car_3", "truck_1"];
    obstacles = ["river", "bush"];
    coins = ["pizza", "coffee"];
  }
  // for (let template_id of templates_to_show) {
  //   addTemplateDiv(template_id);
  // }
  for (let template_id of bots) {
    addBotsDiv(template_id);
  }
  for (let template_id of obstacles) {
    addObstaclesDiv(template_id);
  }
  for (let template_id of coins) {
    addCoinsDiv(template_id);
  }

  setupDraggable(".template", cell_size); //Make all templates draggable
  setupGridDropzone(cell_size); // To style the grid when an object can be dropped

  // grid.add_random_bot({
  //   image: "../assets/None_Doodlebot.png",
  //   policies: new Set(["Get coins"]), //Need the checkbox, hardcode for now
  // });
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
  console.log("Detected update, changing object shown!");
  let DOM_ID = `${updatedObject.type}-${updatedObject.id}`;
  let div = document.getElementById(DOM_ID);
  div.remove(); //Not needed anymore, but paint the object again

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
 * A bot has been created on the VirtualGrid system. This method:
 * 1. Creates the image in the grid at the necessary position
 * 2. Makes the created image draggable
 */
const onAddBot = (bot) => {
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
  bot_dom.style.left = `${cell_size * i}px`;
  bot_dom.style.bottom = `${cell_size * j}px`;
  bot_dom.style.touchAction = "none";

  let rotateArrow = document.createElement("div");
  rotateArrow.innerText = "⟲";
  rotateArrow.classList.add("rotation-handle");
  rotateArrow.addEventListener("click", () => {
    console.log("Tyring to turn 90");
    grid.turn_bot(bot.id, 90);
  });
  bot_dom.appendChild(rotateArrow);

  // Creates the underlying image, with the given dimensions and orientation
  let default_angle = angle % 180 === 0 ? 0 : 90;
  let image_src = default_angle === 0 ? image : image_rotate_90;
  let diff_angle = (360 + angle - default_angle) % 360; //0 or 180

  let imageEl = document.createElement("img");
  imageEl.classList.add("bot-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image_src);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  // Angle defined in bot is not same direction as transform expects
  imageEl.style.transform = `rotate(${360 - diff_angle}deg)`; //transform of 0 or 180 doesn't change width or height
  bot_dom.appendChild(imageEl);

  gridContainer.appendChild(bot_dom);

  //Makes the created div draggable
  setupDraggable(`#${DOM_ID}`, cell_size);
};
/**
 * Pretty much the same as `onAddBot`, just that here we don't need a 'turn' icon
 *
 * @param {*} obstacle
 */
const onAddObstacle = (obstacle) => {
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
  gridContainer.appendChild(obstacle_dom);

  //Makes the created div draggable
  setupDraggable(`#${DOM_ID}`, cell_size);
};
/**
 * Pretty much the same as `onAddBot`, just that here we don't need a 'turn' icon
 *
 * @param {*} obstacle
 */
const onAddCoin = (coin) => {
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
  gridContainer.appendChild(coin_dom);

  //Makes the created div draggable
  setupDraggable(`#${DOM_ID}`, cell_size);
};

//--------------------------- Below code controls moving -------------------------------------///
let intervals = {}; //bot_id -> interval
/**
 * If the bot is moving, it will stop (and vice versa)
 *
 * @param {*} bot_id
 * @param {*} evt
 */
function changeMovingBot(bot_id) {
  let isMoving = bot_id in intervals;
  if (isMoving) {
    //Stop
    console.log("stopping...");
    // socket.emit("stop_bot", "")
    document.getElementById("controls").style.visibility = "visible";
    document.getElementById("objects").style.visibility = "visible";
    document.getElementById("mySidebar").style.width = "500px";
    document.getElementById("main").style.marginLeft = "500px";
    // createDOMGrid("10", "16", "40");
    stopMovingBot(bot_id);
    // if (startBotsButton.innerHTML === "Start!" || "Start moving") {
    //   startButton.innerHTML = "Stop";
    //   document.getElementById("mySidebar").style.width = "0";
    //   document.getElementById("controls").style.visibility = "hidden";
    //   document.getElementById("objects").style.visibility = "hidden";
    //   document.getElementById("main").style.marginLeft = "250px";
    //   // startButton.className = "startbtn btn btn-danger";
    // } else {
    //   startButton.innerHTML = "Stop moving";
    //   document.getElementById("controls").style.visibility = "visible";
    //   document.getElementById("objects").style.visibility = "visible";
    //   document.getElementById("mySidebar").style.width = "500px";
    //   document.getElementById("main").style.marginLeft = "500px";
    //   // startButton.className = "startbtn btn btn-success";
    // }
  } else {
    //Start
    // socket.emit("start_bot", "")
    console.log("starting...");
    document.getElementById("mySidebar").style.width = "0";
    document.getElementById("controls").style.visibility = "hidden";
    document.getElementById("objects").style.visibility = "hidden";
    document.getElementById("main").style.marginLeft = "250px";
    // gridContainer.style.width = `700px`;
    // gridContainer.style.height = `940px`;
    // createDOMGrid("14", "18", "50");
    // var rows = 10; //was 10
    // var cols = 16; //was 20 to get width
    // var cell_size = 40; //was 60
    startMovingBot(bot_id);
  }
}
/** Starts bot by creating a code that runs every certain time */
function startMovingBot(bot_id) {
  if (bot_id in intervals) {
    log("The bot is already moving!");
    return;
  }
  startBotsButton.innerHTML = "Stop moving";
  startBotsButton.classList.remove("bot-start");
  startBotsButton.classList.add("bot-stop");
  function move() {
    console.log("-------------------------MOVING-------------------");
    let num_turns = 1;
    let next_move = grid.get_next_move_using_policies(bot_id, num_turns);
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
function stopMovingBot(bot_id) {
  clearInterval(intervals[bot_id]);
  delete intervals[bot_id];
  //Changing button style
  startBotsButton.innerHTML = "Start moving";
  startBotsButton.classList.remove("bot-stop");
  startBotsButton.classList.add("bot-start");
}
startBotsButton.addEventListener("click", () => {
  for (let bot_id in grid.bots) {
    changeMovingBot(bot_id);
  }
});
