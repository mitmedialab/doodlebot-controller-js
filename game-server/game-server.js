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
//room_id -> JSON representation of the VirtualGrid in the given room
let virtualGrids = {};
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
    if (!(roomId in virtualGrids)) {
      socket.emit("not_valid_room", { roomId });
      return;
    } else {
      socket.join(roomId);
      let virtualGrid = virtualGrids[roomId];
      socket.emit("joined_room", { roomId, virtualGrid });
      socket.activeRoom = roomId;
      return;
    }
  };
  socket.on("create_room", () => {
    // let roomId = generateRandomRoom();
    let roomId = "TEST_ROOM";
    virtualGrids[roomId] = DEFAULT_VIRTUAL_GRID;
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
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_bot", bot);
  });
  socket.on("add_obstacle", async ({ obstacle, virtualGrid }) => {
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_obstacle", obstacle);
  });
  socket.on("add_coin", async ({ coin, virtualGrid }) => {
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("added_coin", coin);
  });
  socket.on("move_bot", ({ bot_id, move, virtualGrid }) => {
    virtualGrids[socket.activeRoom] = virtualGrid;
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
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("updated_bot", { id, update });
  });
  socket.on("update_obstacle", ({ id, update, virtualGrid }) => {
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast
      .to(socket.activeRoom)
      .emit("updated_obstacle", { id, update });
  });
  socket.on("update_coin", ({ id, update, virtualGrid }) => {
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("updated_coin", { id, update });
  });
  socket.on("remove_coin", ({ coin, virtualGrid }) => {
    virtualGrids[socket.activeRoom] = virtualGrid;
    socket.broadcast.to(socket.activeRoom).emit("removed_coin", { coin });
  });

  socket.on("stream", (stream) => {
    socket.broadcast.to(socket.activeRoom).emit("received_stream", stream);
  });
});

const port = 5001;
const fs = require("fs");
http.listen(port, () => {
  console.log(`Now listening on port ${port}`);
});
