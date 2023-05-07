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
    // var alert = document.getElementById("roomCreatedAlert");
    // var alertContent = document.getElementById("roomCreatedAlertContent");
    // alertContent.innerHTML =
    //   "<strong>Room created!</strong><br>Please wait while other players join the room using the room ID shown below.<br><strong>Your room ID is: </strong>" +
    //   room;
    var roomIdBold = document.getElementById("roomIdBold");
    roomIdBold.innerHTML =
      "<strong style='color:black;'>Your room ID is: " + room + "</strong>";
    // alert.style.display = "block";

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
    grid.replace_bot(bot.id, bot, { is_new: true });
    // grid.add_bot(bot, { fromSocket: true });
    // drawBoard();
    // create_bot_options(bot) //Don't show this since it won't be editable by user.
  });
  //reminder: domingo 8am -> 8pm "se te ha hecho el calendario correcto, no se "
  // si es que se va el
  socket.on("added_obstacle", (obstacle) => {
    grid.replace_obstacle(obstacle.id, obstacle, { is_new: true });

    // grid.add_obstacle(obstacle, { fromSocket: true });
  });
  socket.on("added_coin", (coin) => {
    grid.replace_coin(coin.id, coin, { is_new: true });

    // grid.add_coin(coin, { fromSocket: true });
  });
  socket.on("replaced_bot", ({ bot_id, bot }) => {
    grid.replace_bot(bot_id, bot, { is_new: false, fromSocket: true });
  });
  socket.on("replaced_obstacle", ({ obstacle_id, obstacle }) => {
    grid.replace_obstacle(obstacle_id, obstacle, {
      is_new: false,
      fromSocket: true,
    });
  });
  socket.on("replaced_coin", ({ coin_id, coin }) => {
    grid.replace_coin(coin_id, coin, { is_new: false, fromSocket: true });
  });
  socket.on("removed_bot", (bot) => {
    grid.remove_bot(bot.id);
  });
  socket.on("removed_obstacle", (obstacle) => {
    grid.remove_obstacle(obstacle.id);
  });
  socket.on("removed_coin", (coin) => {
    grid.remove_coin(coin.id, { fromSocket: true });
  });
  socket.on("applied_next_move_to_bot", ({ bot_id, move }) => {
    grid.apply_next_move_to_bot(bot_id, move, { fromSocket: true });
  });
  // socket.on("loaded_before_start", () => {

  // });
  // socket.on("started_bot", () => {
  //   // startMovingButton_ClickHandler(currentBotId);
  //   startMovingBot({ fromSocket: true });
  // });
  // socket.on("stopped_bot", () => {
  //   stopMovingBot({ fromSocket: true });
  // });
  socket.on("updated_bot", ({ id, update }) => {
    grid.update_bot(id, update);
  });
  socket.on("updated_obstacle", ({ id, update }) => {
    grid.update_obstacle(id, update);
  });
  socket.on("updated_coin", ({ id, update }) => {
    grid.update_coin(id, update);
  });
  socket.on("changed_load_status", ({ bot_id, loaded }) => {
    console.log("receiving change loade stuatus of bot_id: " + bot_id);
    grid.change_load_status(bot_id, loaded);
  });
  socket.on("changed_moving", async () => {
    await changeMovingBotsHandler({ fromSocket: true }); //Pretends to press the start button
  });
  socket.on("picked_coin", ({ bot, coin }) => {
    removePickedCoin(bot, coin); //Remove
  });
}
