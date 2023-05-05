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

  // new tasneem - starts here
  //done with all tutorials and game demos -- go to index.html to start playing
  socket.on("room_ready_game", () => {
    window.location.href = `index.html?room=${roomId}`;
  });

  //done with tutorial1 go to game1
  socket.on("room_ready_game1", () => {
    // console.log("redirecting from socket-handler.js");
    window.location.href = `game1.html?room=${roomId}`;
  });

  //done with game1 go to tutorial2
  socket.on("room_ready_tutorial2", () => {
    // console.log("redirecting from socket-handler.js");
    window.location.href = `tutorial2.html?room=${roomId}`;
  });

  //done with tutorial2 go to game2
  socket.on("room_ready_game2", () => {
    // console.log("redirecting from socket-handler.js");
    window.location.href = `game2.html?room=${roomId}`;
  });

  //done with game2 go to tutorial3
  socket.on("room_ready_tutorial3", () => {
    // console.log("redirecting from socket-handler.js");
    window.location.href = `tutorial3.html?room=${roomId}`;
  });

  //done with tutorial3 go to game3
  socket.on("room_ready_game3", () => {
    // console.log("redirecting from socket-handler.js");
    window.location.href = `game3.html?room=${roomId}`;
  });

  // new tasneem - ends here
  socket.on("room_ready_tutorial", () => {
    window.location.href = `tutorial.html?room=${room}`;
  });
  socket.on("joined_room", async ({ roomId, virtualGrid }) => {
    console.log(`Detecting joining room: ${roomId}`);
    room = roomId;
    //showing the room ID and a loading icon
    var alert = document.getElementById("roomCreatedAlert");
    var alertContent = document.getElementById("roomCreatedAlertContent");
    alertContent.innerHTML =
      "<strong>Room created!</strong><br>Please wait while other players join the room using the room ID shown below.<br><strong>Your room ID is: </strong>" +
      room;
    var buttonsSection = document.getElementById("buttonsSection");
    buttonsSection.style.marginTop = "10%";
    alert.style.display = "block";

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
