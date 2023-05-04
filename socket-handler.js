const SERVER_LINK = "http://localhost:5001";
let socket;
let room;

document.addEventListener("DOMContentLoaded", () => {
  setupSocket();
});

function setupSocket() {
  socket = io(SERVER_LINK, { autoConnect: false });
  socket.connect();
  socket.on("message_received", (message) => {
    console.log("received message");
    console.log(message);
  });
  socket.on("not_valid_room", ({ roomId }) => {
    alert(`The room ${roomId} is not valid`);
  });
  socket.on("room_ready_game", () => {});
  socket.on("room_ready_tutorial", () => {
    window.location.href = `tutorial.html?room=${room}`;
  });
  socket.on("joined_room", async ({ roomId, virtualGrid }) => {
    console.log(`Detecting joining room: ${roomId}`);
    room = roomId;
    //new: showing the room ID and a loading icon
    var alert = document.getElementById("roomCreatedAlert");
    var alertContent = document.getElementById("roomCreatedAlertContent");
    alertContent.innerHTML =
      "<strong>Room created!</strong><br>Please wait while other players join the room using the room ID shown below.<br><strong>Your room ID is: </strong>" +
      room;
    var buttonsSection = document.getElementById("buttonsSection");
    buttonsSection.style.marginTop = "10%";
    alert.style.display = "block";
    //new code ends here

    // virtualGridContainer.classList.remove("game-hidden");
    // roomNameSpan.innerHTML = roomId;
    // let { rows, cols, bots, obstacles, coins } = virtualGrid;
    // grid = new VirtualGrid(rows, cols, {
    //   bots,
    //   obstacles,
    //   coins,
    //   ...VIRTUAL_GRID_CALLBACKS,
    // });
    // drawBoard();
  });
  socket.on("added_bot", (bot) => {
    grid.add_bot(bot);
    drawBoard();
    // create_bot_options(bot) //Don't show this since it won't be editable by user.
  });
  //reminder: domingo 8am -> 8pm "se te ha hecho el calendario correcto, no se "
  // si es que se va el
  socket.on("added_obstacle", (obstacle) => {
    grid.add_obstacle(obstacle);
    drawBoard();
  });
  socket.on("added_coin", (coin) => {
    grid.add_coin(coin);
    drawBoard();
  });
  socket.on("moved_bot", ({ bot_id, move }) => {
    grid.apply_next_move_to_bot(bot_id, move, { noSocket: true });
    drawBoard();
  });
  socket.on("started_bot", () => {
    startMovingButton_ClickHandler(currentBotId);
  });
  socket.on("stopped_bot", () => {
    stopMovingButton_ClickHandler(currentBotId);
  });
}
