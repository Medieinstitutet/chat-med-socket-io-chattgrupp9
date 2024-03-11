import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Chatt } from "./models/Chatt";

let allMassage: Chatt[] = [
  {
    userName: "Erik",
    userColor: "red",
    chattMessage: "Jag är cool",
  },
  {
    userName: "frid",
    userColor: "blå",
    chattMessage: "Jag är snygg",
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
});

server.listen(PORT, () => {
  console.log("server is running on port ", PORT);
});
