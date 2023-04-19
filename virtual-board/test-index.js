import { setupDraggable, setupGridDropzone } from "./test-interact.js";

let grid;

// TODO: This info should depende on how good it'll look in the screen
let rows = 10;
let cols = 20;
let cell_size = 60;
// Just so that they become global variables
window.rows = rows;
window.cols = cols;
window.cell_size = cell_size;

let ASSETS_FOLDER = "../assets/";
// Should place everything here.
// There will be no resizing, so the width and height are fixed.
const ALL_ASSETS = {
  doodlebot_alone: {
    image: ASSETS_FOLDER + "None_DoodleBot.png",
    width: 3,
    height: 3,
    type: BOT_TYPE,
  },
  doodlebot_cowboy: {
    image: ASSETS_FOLDER + "None_DoodleBot_Cowboy.png",
    width: 3,
    height: 3,
    type: BOT_TYPE,
  },
  building: {
    image: ASSETS_FOLDER + "None_Building.png",
    width: 1,
    height: 3,
    type: OBSTACLE_TYPE,
  },
  coin: {
    image: ASSETS_FOLDER + "None_Coin.png",
    width: 1,
    height: 1,
    type: COIN_TYPE,
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
  gridContainer.style.backgroundImage =
    "url(../assets/None_background_cropped.png)";
  gridContainer.style.width = `${cols * cell_size}px`;
  gridContainer.style.height = `${rows * cell_size}px`;

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
  let { image, width, height, type } = ALL_ASSETS[template_id];

  let imageEl = document.createElement("img");
  imageEl.setAttribute("template_id", template_id); //for later access
  imageEl.classList.add("template"); // For making it interactive later
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;

  waitingRoom.appendChild(imageEl);
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
  let templates_to_show = [
    "doodlebot_alone",
    "doodlebot_cowboy",
    "building",
    "coin",
  ];
  for (let template_id of templates_to_show) {
    addTemplateDiv(template_id);
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
  let imageEl = document.createElement("img");
  imageEl.classList.add("bot-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;
  // Angle defined in bot is not same direction as transform expects
  imageEl.style.transform = `rotate(${360 - angle}deg)`;
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
    stopMovingBot(bot_id);
  } else {
    //Start
    // socket.emit("start_bot", "")
    console.log("starting...");
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
