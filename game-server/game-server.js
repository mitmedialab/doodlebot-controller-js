const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const app = express();
const http = require("http").Server(app);
const { faker } = require("@faker-js/faker"); //For generating room names

app.use(bodyParser.json({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());
const FRONTEND_LINK = "http://localhost:8000";
const socketIO = require("socket.io")(http, {
  cors: {
    origin: [FRONTEND_LINK, "http://localhost:8001"],
  },
});

let DEFAULT_VIRTUAL_GRID = {
  rows: 16, //TODO: Have this come from whoever sets up the room
  cols: 16, //TODO: Have this come from whoever sets up the room
  bots: [],
  obstacles: [],
  coins: [],
};
let DEFAULT_ROOM_INFO = {
  num_users: 0,
  min_users_to_move: 3, //kid 1 + kid2 + teacher
  seen_tutorial: false,
  page0: {
    //page0 is tutorial.html
    num_users: 0,
    min_users_to_move: 2,
  },
  page1: {
    //page1 is game1.html
    num_users: 0,
    min_users_to_move: 2,
  },
  page2: {
    //page2 is tutorial2.html
    num_users: 0,
    min_users_to_move: 2,
  },
  page3: {
    //page3 is game2.html
    num_users: 0,
    min_users_to_move: 2,
  },
  page4: {
    //page3 is tutorial3.html
    num_users: 0,
    min_users_to_move: 2,
  },
  page5: {
    //page3 is game3.html
    num_users: 0,
    min_users_to_move: 2,
  },
  game1: {
    num_users: 0,
    min_users_to_move: 2,
  },
  game2: {
    num_users: 0,
    min_users_to_move: 2,
  },
  game3: {
    num_users: 0,
    min_users_to_move: 2,
  },
  game4: {
    num_users: 0,
    min_users_to_move: 2,
  },
};
let PAGE_ORDER = [
  "tutorial1",
  "game1",
  "tutorial2",
  "game2",
  "tutorial3",
  "game3",
  "tutorial4",
  "game4",
  "tutorial5",
  "final_game",
];
const getNextPage = (page) => {
  let idx = PAGE_ORDER.indexOf(page);
  if (idx === -1) {
    console.error(
      `Careful! The page ${page} is not a valid page from PAGE_ORDER`
    );
  }
  let next_page = PAGE_ORDER[idx + 1];
  let is_game = next_page.startsWith("game");
  return { is_game, next_page };
};
//room_id -> JSON representation of the VirtualGrid in the given room
let room_info = {};
function generateRandomRoom() {
  let adjective = faker.word.adjective();
  let city = faker.word.noun();
  // console.log(ad)
  // let name = `${adjective} ${city}`;
  // let noWhitespaceName = name.replaceAll(" ", "-");
  return city;
}
//Add this before the app.get() block
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
  const joinRoom = (roomId) => {
    if (!(roomId in room_info)) {
      socket.emit("not_valid_room", { roomId });
      return;
    } else {
      console.log(`Joining room ${roomId}`);
      socket.join(roomId);
      let virtualGrid = room_info[roomId];
      socket.emit("joined_room", { roomId, virtualGrid });

      room_info[roomId].num_users += 1;
      socket.activeRoom = roomId;
      console.log(`Number of users now: ${room_info[roomId].num_users}`);
      if (room_info[roomId].num_users === room_info[roomId].min_users_to_move) {
        if (room_info[roomId].seen_tutorial) {
          socketIO.in(socket.activeRoom).emit("room_ready_game", {});
        } else {
          socketIO.in(socket.activeRoom).emit("room_ready_tutorial", {});
        }
      }
      return;
    }
  };
  //the call from the client to connect the socket
  socket.on("join_room_page", (roomId) => {
    console.log(`Joined room: ${roomId}`);
    socket.activeRoom = roomId;
    socket.join(roomId);
  });

  socket.on("create_room", () => {
    let roomId = generateRandomRoom();
    console.log(`Creating room ${roomId}`);
    room_info[roomId] = { ...DEFAULT_ROOM_INFO };
    joinRoom(roomId);
    socket.emit("created_room", {});
  });
  socket.on("join_room", async (roomId) => {
    joinRoom(roomId);
  });

  // new tasneem - starts here

  //finish game3 and wait for others, then go to index.html
  socket.on("finish_all", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    socket.activeRoom = roomId;
    room_info[socket.activeRoom].seen_tutorial = true; //all tutorials done
    room_info[roomId].page5.num_users += 1;
    console.log(
      `Number of users done with game1: ${room_info[roomId].page5.num_users}`
    );
    if (
      room_info[roomId].page5.num_users ===
      room_info[roomId].page5.min_users_to_move
    ) {
      console.log("redirecting to index.html now");
      socketIO.in(socket.activeRoom).emit("room_ready_game", {});
    }
  });

  // socket.on("finish_all", () => {
  //   room_info[socket.activeRoom].seen_tutorial = true;
  // });

  // When users pressed 'Continue'. If everyone did then it moves to next page
  socket.on("finish_page", ({ roomId, page }) => {
    console.log(room_info);
    if (!(roomId in room_info)) {
      room_info[roomId] = { ...DEFAULT_ROOM_INFO };
    }
    if (!(page in room_info[roomId])) {
      room_info[roomId][page] = {
        num_users: 0,
        min_users_to_move: 2,
      };
    }
    socket.activeRoom = roomId;

    room_info[roomId][page].num_users += 1;
    let { num_users, min_users_to_move } = room_info[roomId][page];
    console.log(`Number of users done with ${page}: ${num_users}`);
    if (num_users === min_users_to_move) {
      //Ready to move!
      let { next_page, is_game } = getNextPage(page);
      if (!is_game) {
        socketIO
          .in(socket.activeRoom)
          .emit("page_ready", { roomId, is_game, page: next_page });
      } else {
        //If it's a game, users will need to know their bot_id. Let's decide it here

        socket.emit("page_ready", {
          roomId,
          is_game,
          page: next_page,
          bot_id: 1,
        }); //Assign who is who
        // TODO: Send a different id to different users (assuming there's more than 2)
        socket.broadcast
          .to(socket.activeRoom)
          .emit("page_ready", { roomId, is_game, page: next_page, bot_id: 2 }); //Assign who is who
      }
    }
  });

  socket.on("choose_theme", ({ roomId, option, mode }) => {
    console.log(`[${socket.activeRoom}] Detected choose_theme. Notifying.`);

    socket.activeRoom = roomId;
    socket.broadcast
      .to(socket.activeRoom)
      .emit("theme_chosen", { roomId, option, mode });
  });

  //finish tutorial1 and wait for others, then go to game1
  socket.on("finish_tutorial1", (roomId) => {
    console.log(roomId);
    room_info[roomId].tutorial1.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with tutorial1: ${room_info[roomId].tutorial1.num_users}`
    );
    if (
      room_info[roomId].tutorial1.num_users ===
      room_info[roomId].tutorial1.min_users_to_move
    ) {
      console.log("redirecting to game1.html now");

      socket.emit("room_ready_game1", { bot_id: 1 }); //Assign who is who
      // TODO: Send a different id to different users (assuming there's more than 2)
      socket.broadcast
        .to(socket.activeRoom)
        .emit("room_ready_game1", { bot_id: 2 }); //Assign who is who

      // socketIO.in(socket.activeRoom).emit("room_ready_game1", {});
    }
  });

  //finish game1 and wait for others, then go to tutorial2
  socket.on("finish_game1", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    room_info[roomId].game1.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with game1: ${room_info[roomId].page1.num_users}`
    );
    if (
      room_info[roomId].game1.num_users ===
      room_info[roomId].game1.min_users_to_move
    ) {
      console.log("redirecting to tutorial2.html now");
      socketIO.in(socket.activeRoom).emit("room_ready_tutorial2", {});
    }
  });

  //finish tutorial2 and wait for others, then go to game2
  socket.on("finish_tutorial2", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    room_info[roomId].tutorial2.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with tutorial2: ${room_info[roomId].tutorial2.num_users}`
    );
    if (
      room_info[roomId].tutorial2.num_users ===
      room_info[roomId].tutorial2.min_users_to_move
    ) {
      console.log("redirecting to game2.html now");
      socket.emit("room_ready_game2", { bot_id: 1 }); //Assign who is who
      // TODO: Send a different id to different users (assuming there's more than 2)
      socket.broadcast
        .to(socket.activeRoom)
        .emit("room_ready_game2", { bot_id: 2 }); //Assign who is who
    }
  });

  //finish game2 and wait for others, then go to tutorial3
  socket.on("finish_game2", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    room_info[roomId].game2.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with game1: ${room_info[roomId].game2.num_users}`
    );
    if (
      room_info[roomId].game2.num_users ===
      room_info[roomId].game2.min_users_to_move
    ) {
      console.log("redirecting to tutorial3.html now");
      socketIO.in(socket.activeRoom).emit("room_ready_tutorial3", {});
    }
  });

  //finish tutorial3 and wait for others, then go to game3
  socket.on("finish_tutorial3", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    room_info[roomId].tutorial3.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with tutorial2: ${room_info[roomId].tutorial3.num_users}`
    );
    if (
      room_info[roomId].tutorial3.num_users ===
      room_info[roomId].tutorial3.min_users_to_move
    ) {
      console.log("redirecting to game3.html now");
      socket.emit("room_ready_game3", { bot_id: 1 }); //Assign who is who
      // TODO: Send a different id to different users (assuming there's more than 2)
      socket.broadcast
        .to(socket.activeRoom)
        .emit("room_ready_game3", { bot_id: 2 }); //Assign who is who
    }
  });
  //finish game1 and wait for others, then go to tutorial2
  socket.on("finish_game3", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    room_info[roomId].game3.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with game1: ${room_info[roomId].game3.num_users}`
    );
    if (
      room_info[roomId].game3.num_users ===
      room_info[roomId].game3.min_users_to_move
    ) {
      console.log("redirecting to tutorial2.html now");
      socketIO.in(socket.activeRoom).emit("room_ready_tutorial4", {});
    }
  });
  //finish tutorial3 and wait for others, then go to game3
  socket.on("finish_tutorial4", (roomId) => {
    room_info[roomId] = DEFAULT_ROOM_INFO;
    console.log(roomId);
    room_info[roomId].tutorial4.num_users += 1;
    socket.activeRoom = roomId;
    console.log(
      `Number of users done with tutorial2: ${room_info[roomId].tutorial4.num_users}`
    );
    if (
      room_info[roomId].tutorial4.num_users ===
      room_info[roomId].tutorial4.min_users_to_move
    ) {
      console.log("redirecting to game3.html now");
      socketIO.in(socket.activeRoom).emit("room_ready_game3", {});
    }
  });

  // new tasneem - ends here

  /**
   * data has same field as a `ChatMessage`
   */
  socket.on("new_message", async (data) => {
    console.log("data received:");
    console.log(data);
    let newMessage = "Received: " + JSON.stringify(data);
    socket.broadcast.to(socket.activeRoom).emit("message_received", newMessage);
  });
  socket.on("add_bot", async ({ bot, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected add bot. Notifying.`);
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_bot", bot);
  });
  socket.on("add_obstacle", async ({ obstacle, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected add obstacle. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_obstacle", obstacle);
  });
  socket.on("add_coin", async ({ coin, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected add coin. Notifying.`);
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_coin", coin);
  });
  socket.on("remove_bot", async ({ bot, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected remove bot. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("removed_bot", bot);
  });
  socket.on("remove_obstacle", async ({ obstacle, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected remove obstacle. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("removed_obstacle", obstacle);
  });
  socket.on("remove_coin", async ({ coin, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected remove coin. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("removed_coin", coin);
  });
  socket.on("apply_next_move_to_bot", ({ bot_id, move, virtualGrid }) => {
    console.log(
      `[${socket.activeRoom}] Detected apply_next_move_to_bot bot. Notifying.`
    );
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast
      .to(socket.activeRoom)
      .emit("applied_next_move_to_bot", { bot_id, move });
  });

  // socket.on("load_before_start", (data) => {
  //   console.log(`[${socket.activeRoom}] Detected load bot. Notifying.`);
  //   socket.broadcast.to(socket.activeRoom).emit("loaded_before_start", data);
  // });
  // socket.on("start_bot", (data) => {
  //   console.log(`[${socket.activeRoom}] Detected start bot. Notifying.`);
  //   socket.broadcast.to(socket.activeRoom).emit("started_bot", data);
  // });
  // socket.on("stop_bot", (data) => {
  //   console.log(`[${socket.activeRoom}] Detected stop bot. Notifying.`);
  //   socket.broadcast.to(socket.activeRoom).emit("stopped_bot", data);
  // });
  //socket.emit("update_bot", {id, update, virtualGrid: grid.toJSON()})
  socket.on("update_bot", ({ id, update, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected update bot. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("updated_bot", { id, update });
  });
  socket.on("update_obstacle", ({ id, update, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected update obstacle. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast
      .to(socket.activeRoom)
      .emit("updated_obstacle", { id, update });
  });
  socket.on("update_coin", ({ id, update, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected update coin. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("updated_coin", { id, update });
  });
  socket.on("remove_coin", ({ coin, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected remove coin. Notifying.`);
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("removed_coin", { coin });
  });
  socket.on(
    "change_require_graph",
    ({ bot_id, require_graph, virtualGrid }) => {
      console.log(
        `[${socket.activeRoom}] Detected load status of bot ${bot_id} changed. Notifying.`
      );

      socket.broadcast
        .to(socket.activeRoom)
        .emit("changed_require_graph", { bot_id, require_graph });
    }
  );

  // socket.on("change_moving", () => {
  //   console.log(`[${socket.activeRoom}] Detected change moving. Notifying.`);

  //   socket.broadcast.to(socket.activeRoom).emit("changed_moving", {});
  // });
  socket.on("replace_bot", ({ bot_id, bot, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected replace bot. Notifying.`);
    socket.broadcast
      .to(socket.activeRoom)
      .emit("replaced_bot", { bot_id, bot });
  });
  socket.on("replace_bot_ready_to_start", ({ bot, virtualGrid }) => {
    console.log(
      `[${socket.activeRoom}] Detected update bot's ready_to_start status. Notifying.`
    );
    // room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast
      .to(socket.activeRoom)
      .emit("replaced_bot_ready_to_start", { bot });
  });
  socket.on("everyone_ready_to_start", () => {
    socketIO.in(socket.activeRoom).emit("everyone_ready_to_start", {});
  });
  socket.on("stop_moving", () => {
    socketIO.in(socket.activeRoom).emit("stop_moving", {});
  });
  socket.on("replace_obstacle", ({ obstacle_id, obstacle, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected replace obstacle. Notifying.`);
    socket.broadcast
      .to(socket.activeRoom)
      .emit("replaced_obstacle", { obstacle_id, obstacle });
  });
  socket.on("replace_coin", ({ coin_id, coin, virtualGrid }) => {
    console.log(`[${socket.activeRoom}] Detected replace coin. Notifying.`);
    socket.broadcast
      .to(socket.activeRoom)
      .emit("replaced_coin", { coin_id, coin });
  });
  socket.on("activate_camera", (data) => {
    console.log(`[${socket.activeRoom}] Detected activate camera. Notifying.`);
    socket.broadcast.to(socket.activeRoom).emit("activated_camera", data);
  });
  // socket.on("pick_coin", ({ bot, coin, virtualGrid }) => {
  //   console.log(`[${socket.activeRoom}] Detected pick coin. Notifying.`);

  //   socket.broadcast.to(socket.activeRoom).emit("picked_coin", { bot, coin });
  // });
});

const port = 5001;
const fs = require("fs");
http.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
