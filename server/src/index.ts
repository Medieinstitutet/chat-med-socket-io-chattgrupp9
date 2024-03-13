import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Chatt } from "./models/Chatt";
import { Room } from "./models/Room";

import path from "path";
const time = new Date().toTimeString();
let allMassage: Chatt[] = [
  {
    userName: "Erik",
    userColor: "#330088",
    chattMessage: "Jag är cool",
    time: time,
  },
  {
    userName: "frid",
    userColor: "#225577",
    chattMessage: "Jag är snygg",
    time: time,
  },
];

let allRooms: Room[] = [
  {
    roomId: "1",
    roomName: "Erik",
    Chatts: [],
  },
  {
    roomId: "2",
    roomName: "Gustav",
    Chatts: [],
  },
  {
    roomId: "3",
    roomName: "Marcus",
    Chatts: [],
  },
];

const PORT = 3000;
const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket: Socket) => {
  console.log("a user  connected");

  socket.emit("all_rooms", allRooms);

  socket.emit(
    "all_message",
    allMassage.map((massage) => {
      return {
        userName: massage.userName,
        userColor: massage.userColor,
        chattMessage: massage.chattMessage,
      };
    })
  );

  socket.on("join_room", (id: string, callback) => {
    socket.rooms.forEach((room) => {
      console.log("Leaving room: ", room);
      console.log(allRooms);
      socket.leave(room);
    });

    console.log("Joining room: ", id);

    socket.join(id);

    callback(allRooms.find((r) => r.roomId === id));
  });
  console.log("a user connected");
  socket.emit("all_massage", allMassage);
  socket.on("new_massage", (data: Chatt) => {
    allMassage.push(data);
    console.log(allMassage);
    io.emit("add_massage", allMassage);
  });
  socket.on("edit_message", (data: { index: number; newMessage: string }) => {
    const { index, newMessage } = data;
    if (index >= 0 && index < allMassage.length) {
      allMassage[index].chattMessage = newMessage;
      console.log(allMassage);
      io.emit("edit_message_success", allMassage);
    }
  });
});

server.listen(PORT, () => {
  console.log("server is running on port ", PORT);
});
