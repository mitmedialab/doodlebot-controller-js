import { setupDraggable } from "./test-interact.js";

let grid;
let rows = 10;
let cols = 20;
let cell_size = 30;
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
  grid = new VirtualGrid(rows, cols, { onAddBot });
  window.grid = grid;

  grid.add_random_bot({ image: "../assets/None_Doodlebot.png" });
  grid.add_random_bot({ image: "../assets/None_Doodlebot_Cowboy.png" });

  //   grid.add_random_coin();
  //   grid.add_random_obstacle();

  console.log(grid);
});

const onAddBot = (bot) => {
  let {
    width,
    height,
    real_bottom_left: [i, j],
  } = bot;

  //Creating a div at the given position
  let bot_dom = document.createElement("div");
  bot_dom.classList.add("bot-container");
  let DOM_ID = `${BOT_TYPE}-${bot.id}`;
  bot_dom.setAttribute("id", DOM_ID);
  bot_dom.style.left = `${cell_size * i}px`;
  bot_dom.style.bottom = `${cell_size * j}px`;

  // Creates the underlying image, with the given dimensions and orientation
  let image = document.createElement("img");
  image.classList.add("bot-image");
  image.setAttribute(`id`, `${DOM_ID}-image`);
  image.setAttribute("src", bot.image);
  image.style.width = `${cell_size * width}px`;
  image.style.height = `${cell_size * height}px`;
  // Angle defined in bot is not same direction as transform expects
  image.style.transform = `rotate(${360 - bot.angle}deg)`;

  bot_dom.appendChild(image);
  gridContainer.appendChild(bot_dom);

  //Makes the created div draggable
  setupDraggable(DOM_ID, cell_size);
};
