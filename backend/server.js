const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    if (rooms[roomId]) {
      socket.emit("loadCanvas", rooms[roomId]); 
    }
  });

  socket.on("clearCanvas", ({ roomId }) => {
    io.to(roomId).emit("clearCanvas");
  });
  

  socket.on("drawing", ({ roomId, data }) => {
    rooms[roomId] = data; 
    socket.to(roomId).emit("drawing", data); 
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => console.log("Server running on port 4000"));
