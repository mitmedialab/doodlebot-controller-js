// let laptop_ip = "192.168.41.240";
let laptop_ip = "localhost";

window.laptop_ip = laptop_ip;
const SERVER_LINK = `http://${laptop_ip}:5001`;
let socket;
let room;
// let is_tutor = false;
// window.is_tutor = is_tutor;

document.addEventListener("DOMContentLoaded", () => {
  setupSocket();
});
const getIsTutor = () => {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("is_tutor") === "true";
};
const updateIfTutor = (url) => {
  if (getIsTutor()) {
    return (url += "&is_tutor=true");
  } else {
    return url;
  }
};
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
    window.location.href = updateIfTutor(`index.html?room=${roomId}`);
  });

  //done with tutorial1 go to game1
  socket.on("room_ready_game1", ({ bot_id }) => {
    // console.log("redirecting from socket-handler.js");
    // window.location.href = `game1.html?room=${roomId}&bot_id=${bot_id}`;
    let theme = "None"; //One of None, City, School or Pacman
    window.location.href = updateIfTutor(
      `virtualMode.html?option=${theme}&mode=virtual&room=${roomId}&tutorial=${1}&bot_id=${bot_id}`
    );
  });
  socket.on("created_room", () => {
    console.log("detectd created room");
    is_tutor = true;
    window.is_tutor = is_tutor;
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
    if (is_tutor) {
      window.location.href = `tutorial.html?room=${room}&is_tutor=true`;
    } else {
      window.location.href = `tutorial.html?room=${room}`;
    }
  });
  socket.on("page_ready", ({ roomId, is_game, page, bot_id }) => {
    let GAME_TO_THEME = {
      game1: "None",
      game2: "School",
      game3: "City",
      game4: "Pacman",
    };
    if (page === "final_game") {
      window.location.href = updateIfTutor(`index.html?room=${roomId}`);
      return;
    }
    if (is_game) {
      if (getIsTutor()) {
        window.location.href = `virtualMode.html?option=${GAME_TO_THEME[page]}&mode=virtual&room=${roomId}&tutorial=${page}&is_tutor=true`;
      } else {
        window.location.href = `virtualMode.html?option=${GAME_TO_THEME[page]}&mode=virtual&room=${roomId}&tutorial=${page}&bot_id=${bot_id}`;
      }
      return;
    } else {
      window.location.href = updateIfTutor(`${page}.html?room=${roomId}`);
      return;
    }
  });
  socket.on("theme_chosen", ({ roomId, option, mode }) => {
    window.location.href = `virtualMode.html?option=${option}&mode=${mode}&room=${roomId}`;
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
  // socket.on("joined_room_page", ({ roomId, virtualGrid }) => {
  //   console.log(`Detecting joining room: ${roomId}`);
  //   room = roomId;
  //   // setupGridFromPrevious(virtualGrid);
  // });
  socket.on("added_bot", (bot) => {
    grid.replace_bot(bot.id, bot, { is_new: true, fromSocket: true });
    // grid.add_bot(bot, { fromSocket: true });
    // drawBoard();
    // create_bot_options(bot) //Don't show this since it won't be editable by user.
  });
  //reminder: domingo 8am -> 8pm "se te ha hecho el calendario correcto, no se "
  // si es que se va el
  socket.on("added_obstacle", (obstacle) => {
    grid.replace_obstacle(obstacle.id, obstacle, {
      is_new: true,
      fromSocket: true,
    });

    // grid.add_obstacle(obstacle, { fromSocket: true });
  });
  socket.on("added_coin", (coin) => {
    grid.replace_coin(coin.id, coin, { is_new: true, fromSocket: true });

    // grid.add_coin(coin, { fromSocket: true });
  });
  socket.on("replaced_bot", ({ bot_id, bot }) => {
    grid.replace_bot(bot_id, bot, { is_new: false, fromSocket: true });
  });
  socket.on("replaced_bot_ready_to_start", ({ bot }) => {
    grid.replace_bot(bot.id, bot, {
      is_new: false,
      fromSocket: true,
      changed_ready_start: true,
    });
    // countReadyToStart.innerText = grid.num_users_ready_to_start();
    if (bot.id !== currentBotId) {
      if (bot.is_ready_to_start) {
        body.setAttribute("show-other-user-ready", "");
      } else {
        body.removeAttribute("show-other-user-ready");
      }
    }
  });
  socket.on("everyone_ready_to_start", async () => {
    //Actually start
    hideWaitModal();
    body.removeAttribute("show-other-user-ready");
    await startMovingBot(currentBotId);
  });
  socket.on("stop_moving", () => {
    grid.reset_ready_to_start();
    // countReadyToStart.innerText = grid.num_users_ready_to_start();
    body.removeAttribute("show-other-user-ready");
    body.removeAttribute("is-waiting-for-users");
    stopMovingBot(currentBotId, { fromSocket: true });
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
  socket.on("changed_require_graph", ({ bot_id, require_graph }) => {
    console.log("receiving change require graph of bot_id: " + bot_id);
    grid.change_require_graph(bot_id, require_graph);
  });
  // socket.on("changed_moving", async () => {
  //   await changeMovingBotsHandler({ fromSocket: true }); //Pretends to press the start button
  // });
  socket.on("picked_coin", ({ bot, coin }) => {
    removePickedCoin(bot, coin); //Remove
  });
  socket.on("activated_camera", async () => {
    console.log("received activate camera, setting up!");
    await setupCameraStream({ is_remote: true });
  });
}

class RealtimeUpdates {
  constructor() {}
  activate_camera() {
    socket.emit("activate_camera", {});
  }
  /*--------   Room handlers ------- */

  create_room(data) {
    //empty
    socket.emit("create_room", data);
  }
  join_room(data) {
    //roomId
    socket.emit("join_room", data);
  }
  join_room_page(data) {
    //roomId
    socket.emit("join_room_page", data);
  }

  /*--------   Add objects ------- */

  add_bot(data) {
    //bot, virtualGrid
    socket.emit("add_bot", data);
  }
  add_obstacle(data) {
    //obstacle, virtualGrid
    socket.emit("add_obstacle", data);
  }
  add_coin(data) {
    //coin, virtualGrid
    socket.emit("add_coin", data);
  }

  /*--------   Replace objects ------- */

  replace_bot(data) {
    //bot_id, bot, virtualGrid
    socket.emit("replace_bot", data);
  }
  replace_obstacle(data) {
    //obstacle_id, obstacle, virtualGrid
    socket.emit("replace_obstacle", data);
  }
  replace_coin(data) {
    //coin_id, coin, virtualGrid
    socket.emit("replace_coin", data);
  }

  /*--------   Remove  objects ------- */

  remove_bot(data) {
    //bot, virtualGrid
    socket.emit("remove_bot", data);
  }
  remove_obstacle(data) {
    // obstacle, virtualGrid
    socket.emit("remove_obstacle", data);
  }
  remove_coin(data) {
    //coin, virtualGrid
    socket.emit("remove_coin", data);
  }

  /*--------   Tutorial handlers ------- */

  choose_theme(data) {
    //option (None, City,..), mode (virtual vs camera), roomId
    socket.emit("choose_theme", data);
  }

  finish_page(data) {
    //roomId, page
    socket.emit("finish_page", data);
  }

  /*--------   Game handlers ------- */

  replace_bot_ready_to_start(data) {
    //bot, virtualGrid
    socket.emit("replace_bot_ready_to_start", data);
  }
  everyone_ready_to_start(data) {
    //{}
    socket.emit("everyone_ready_to_start", data);
  }
  stop_moving(data) {
    //{}
    socket.emit("stop_moving", data);
  }
  change_require_graph(data) {
    //bot_id, require_graph
    socket.emit("change_require_graph", data);
  }
}

let live_updates = new RealtimeUpdates();
