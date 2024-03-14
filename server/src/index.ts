import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Chatt } from "./models/Chatt";
import { Room } from "./models/Room";

const time = new Date().toTimeString();
let allRooms: Room[] = [
  {
    roomId: "1",
    roomName: "Erik",
    Chatts: [
      {
        userName: "Erik",
        chattID: "123",
        userColor: "#330088",
        chattMessage: "Jag är cool",
        time: time,
      },
    ],
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

  socket.on("new_massage", (data: Chatt) => {
    console.log("New message: ", data);

    const chatt = allRooms.find((r) => r.roomId === data.chattID);
    chatt?.Chatts.push(data);

    io.to(data.chattID).emit(
      "all_massage",
      allRooms.find((r) => r.roomId === data.chattID)
    );
  });
  socket.on(
    "edit_message",
    (data: { index: number; newMessage: string; chattId: string }) => {
      const { chattId, index, newMessage } = data;
      const chatt = allRooms.find((r) => r.roomId === chattId);
      if (chatt && index >= 0 && index < chatt.Chatts.length) {
        chatt.Chatts[index].chattMessage = newMessage;
        console.log(chatt.Chatts);
        io.to(chattId).emit(
          "edit_message_success",
          allRooms.find((r) => r.roomId === chattId)
        );
      }
    }
  );
});

server.listen(PORT, () => {
  console.log("server is running on port ", PORT);
});
