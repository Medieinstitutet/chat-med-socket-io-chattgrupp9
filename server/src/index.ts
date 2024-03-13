import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Chatt } from "./models/Chatt";
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

const PORT = 3000;
const app = express();

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket: Socket) => {
  console.log("a user connected");
  socket.emit("all_massage", allMassage);
  socket.on("new_massage", (data: Chatt) => {
    allMassage.push(data);
    console.log(allMassage);
    io.emit("add_massage", allMassage);
  });
});

server.listen(PORT, () => {
  console.log("server is running on port ", PORT);
});
