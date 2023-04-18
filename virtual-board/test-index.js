import { setupDraggable, setupGridDropzone } from "./test-interact.js";

let grid;
let rows = 10;
let cols = 20;
let cell_size = 60;
/**
 * Creates a grid where each cell is cell_size px x cell_size px
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
    // // rowNumberDiv.style.width = `${cell_size}px`;
    // rowNumberDiv.style.height = `${cell_size}px`;
    // row.appendChild(rowNumberDiv);
    for (let j = 0; j < cols; j++) {
      let cell = document.createElement("div");
      cell.classList.add("grid-column");
      cell.style.width = `${cell_size}px`;
      cell.style.height = `${cell_size}px`;
      // let text = board[i][j];
      // cell.innerText = text;
      // if (text.startsWith(BOT_TYPE)){
      //     if (text.startsWith(`${BOT_TYPE}-edge`)){
      //         cell.classList.add("cell-bot-edge")
      //     } else{
      //         cell.classList.add("cell-bot")
      //     }
      // } else if (text.startsWith(OBSTACLE_TYPE)){
      //     cell.classList.add("cell-obstacle")
      // } else if (text.startsWith(COIN_TYPE)){
      //     cell.classList.add("cell-coin")
      // }
      row.appendChild(cell);

      //   if (i === 0) {
      //     let colDiv = document.createElement("div");
      //     colDiv.classList.add("cell-column-text");
      //     colDiv.innerHTML = `Col ${j}`;
      //     // colDiv.style.width = `${cell_size}px`;
      //     colDiv.style.height = `${cell_size}px`;
      //     colNumbersDiv.appendChild(colDiv);
      //   }
    }
    gridContainer.appendChild(row);
  }
  gridContainer.appendChild(colNumbersDiv);
};
document.addEventListener("DOMContentLoaded", () => {
  console.log(rows, cols);
  // grid = new VirtualGrid(rows, cols, VIRTUAL_GRID_CALLBACKS);
  // boardDrawing = setInterval(drawBoard, 1) //Get the latest state every 500 ms
  // let duration = 100;
  // setTimeout(function a() {
  // // your own code
  //     drawBoard()
  //     setTimeout(a, duration);
  // }, duration);
  // drawBoard();
  //   setupSocket();
  createDOMGrid(rows, cols, cell_size);
  grid = new VirtualGrid(rows, cols, {
    onAddBot,
    onAddObstacle,
    onAddCoin,
    onPickupCoin,
  });
  window.grid = grid;
  setupDraggable(".template", cell_size); //Make all templates draggable
  setupGridDropzone(cell_size); //Make it droppable

  // grid.add_random_bot({
  //   image: "../assets/None_Doodlebot.png",
  //   policies: new Set(["Get coins"]), //Need the checkbox, hardcode for now
  // });

  // grid.add_random_bot({
  //   image: "../assets/None_Doodlebot_Cowboy.png",
  //   policies: new Set(["Get coins"]), //Need the checkbox, hardcode for now
  // });

  // grid.add_random_coin({ image: "../assets/None_Coin.png" });
  // grid.add_random_coin({ image: "../assets/None_Coin.png" });
  // grid.add_random_coin({ image: "../assets/None_Coin.png" });

  // grid.add_random_obstacle({ image: "../assets/None_Building.png" });
  // grid.add_random_obstacle({ image: "../assets/None_Building.png" });
});
const onPickupCoin = (bot, coin) => {
  //Remove the image of the coin!
  let dom_id = `${COIN_TYPE}-${coin.id}`;
  document.getElementById(dom_id).remove();
};
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
  bot_dom.setAttribute("id", DOM_ID);
  bot_dom.style.left = `${cell_size * i}px`;
  bot_dom.style.bottom = `${cell_size * j}px`;

  let rotateArrow = document.createElement("div");
  rotateArrow.innerText = "⟲";
  rotateArrow.classList.add("rotation-handle");
  rotateArrow.addEventListener("click", () => {
    //Remove previous, and paint again
    document.getElementById(DOM_ID).remove();
    let res = grid.turn_bot(bot.id, 90);
    onAddBot(res.bot);
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
  obstacle_dom.setAttribute("id", DOM_ID);
  obstacle_dom.style.left = `${cell_size * i}px`;
  obstacle_dom.style.bottom = `${cell_size * j}px`;

  // Creates the underlying image, with the given dimensions and orientation
  let imageEl = document.createElement("img");
  imageEl.classList.add("obstacle-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;

  obstacle_dom.appendChild(image);
  gridContainer.appendChild(obstacle_dom);

  //Makes the created div draggable
  setupDraggable(`#${DOM_ID}`, cell_size);
};

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
  coin_dom.setAttribute("id", DOM_ID);
  coin_dom.style.left = `${cell_size * i}px`;
  coin_dom.style.bottom = `${cell_size * j}px`;

  // Creates the underlying image, with the given dimensions and orientation
  let imageEl = document.createElement("img");
  imageEl.classList.add("coin-image");
  imageEl.setAttribute(`id`, `${DOM_ID}-image`);
  imageEl.setAttribute("src", image);
  imageEl.style.width = `${cell_size * width}px`;
  imageEl.style.height = `${cell_size * height}px`;

  coin_dom.appendChild(image);
  waitingRoom.appendChild(coin_dom);

  //Makes the created div draggable
  setupDraggable(`#${DOM_ID}`, cell_size);
};
const updateBotInVirtualGrid = (id, type) => {
  let bot = grid.bots[id][0];
  let domID = `${type}-${id}`;
  let div = document.getElementById(domID);
  //TODO: Check if deleting is needed, or could just update
  div.remove(); //Restart view for this bot
  onAddBot(bot); //Add the one with the new position/angle
};
let intervals = {};
function changeMoving_ClickHandler(bot_id, evt) {
  let isMoving = bot_id in intervals;
  if (isMoving) {
    //Stop
    // socket.emit("stop_bot", "")
    stopMovingButton_ClickHandler(bot_id, evt);
    // evt.target.innerHTML = "Start moving";
    // evt.target.classList.remove("bot-stop");
    // evt.target.classList.add("bot-start");
  } else {
    //Start
    // socket.emit("start_bot", "")
    startMovingButton_ClickHandler(bot_id, evt);
    // evt.target.innerHTML = "Stop moving";
    // evt.target.classList.remove("bot-start");
    // evt.target.classList.add("bot-stop");
  }
}
function startMovingButton_ClickHandler(bot_id, evt) {
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
    updateBotInVirtualGrid(bot_id, BOT_TYPE);
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

function stopMovingButton_ClickHandler(bot_id, evt) {
  clearInterval(intervals[bot_id]);
  delete intervals[bot_id];
  //Changing button style
  startBotsButton.innerHTML = "Start moving";
  startBotsButton.classList.remove("bot-stop");
  startBotsButton.classList.add("bot-start");
}
startBotsButton.addEventListener("click", () => {
  for (let bot_id in grid.bots) {
    changeMoving_ClickHandler(bot_id);
  }
});
