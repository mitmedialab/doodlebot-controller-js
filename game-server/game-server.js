const express = require("express")
const cors = require("cors");
const bodyParser = require("body-parser")
const morgan = require("morgan")
const app = express();
const http = require('http').Server(app);

app.use(bodyParser.json({extended: true}))
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(morgan("dev"))
app.use(cors())
const FRONTEND_LINK = "http://localhost:8000";
const socketIO = require('socket.io')(http, {
  cors: {
      origin: FRONTEND_LINK
  }
});
//Add this before the app.get() block
socketIO.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
  socket.on("join_room", async (roomId)=> {
    try {
      console.log(`Joining room ${roomId}`);
      socket.join(roomId);
      socket.emit("joined_room", roomId);
      socket.activeRoom = roomId;
    } catch(err){
      console.log(`Error joining room ${roomId}`)
      console.log(err);
    }
  })
  /**
   * data has same field as a `ChatMessage`
   */
  socket.on("new_message", async (data) => {
    console.log("data received:");
    console.log(data);
    let newMessage = "Received: " + JSON.stringify(data);
    socket.broadcast.to(socket.activeRoom).emit('message_received', newMessage);
  })
    socket.on("add_bot", async (data) => {
        socket.broadcast.to(socket.activeRoom).emit("added_bot", data);
  })
    socket.on("add_obstacle", async (data) => {
    socket.broadcast.to(socket.activeRoom).emit("added_obstacle", data);
  })
    socket.on("add_coin", async (data) => {
    socket.broadcast.to(socket.activeRoom).emit("added_coin", data);
  })
  socket.on("move_bot", (data) => {
    socket.broadcast.to(socket.activeRoom).emit("moved_bot", data);
  })
});

const port = 5001;
const fs = require('fs');
http.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 