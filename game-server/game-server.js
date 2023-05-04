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
  min_users_to_move: 2,
  seen_tutorial: false,
};
//room_id -> JSON representation of the VirtualGrid in the given room
let room_info = {};
function generateRandomRoom() {
  let adjective = faker.word.adjective();
  let city = faker.word.noun();
  let name = `${adjective} ${city}`;
  let noWhitespaceName = name.replaceAll(" ", "-");
  return noWhitespaceName;
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
  socket.on("finish_tutorial", () => {
    room_info[socket.activeRoom].seen_tutorial = true;
  });
  socket.on("create_room", () => {
    let roomId = generateRandomRoom();
    console.log(`Creating room ${roomId}`);
    room_info[roomId] = DEFAULT_ROOM_INFO;
    joinRoom(roomId);
  });
  socket.on("join_room", async (roomId) => {
    joinRoom(roomId);
  });
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
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_bot", bot);
  });
  socket.on("add_obstacle", async ({ obstacle, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_obstacle", obstacle);
  });
  socket.on("add_coin", async ({ coin, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_coin", coin);
  });
  socket.on("move_bot", ({ bot_id, move, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("moved_bot", { bot_id, move });
  });
  socket.on("stop_bot", (data) => {
    socket.broadcast.to(socket.activeRoom).emit("stopped_bot", data);
  });
  socket.on("start_bot", (data) => {
    socket.broadcast.to(socket.activeRoom).emit("started_bot", data);
  });
  //socket.emit("update_bot", {id, update, virtualGrid: grid.toJSON()})
  socket.on("update_bot", ({ id, update, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("updated_bot", { id, update });
  });
  socket.on("update_obstacle", ({ id, update, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast
      .to(socket.activeRoom)
      .emit("updated_obstacle", { id, update });
  });
  socket.on("update_coin", ({ id, update, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("updated_coin", { id, update });
  });
  socket.on("remove_coin", ({ coin, virtualGrid }) => {
    room_info[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("removed_coin", { coin });
  });
});

const port = 5001;
const fs = require("fs");
http.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
