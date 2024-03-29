import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Chatt } from "./models/Chatt";
import { Room } from "./models/Room";

const time = new Date().toTimeString();
let allUsers: { name: string }[] = [];
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

  socket.emit("all_users", allUsers);

  socket.on("set_username", (username: string) => {
    if (allUsers.some((user) => user.name === username)) {
      socket.emit("username_exists", username);
    } else {
      allUsers.push({ name: username });
      socket.emit("username_unique", username);
    }
    console.log("all users", allUsers);
  });

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

  socket.on("check_username", (username: string, callback) => {
    if (allUsers.find((name) => name.name === username)) callback(false);
    else return callback(true);
  });
});

server.listen(PORT, () => {
  console.log("server is running on port ", PORT);
});
