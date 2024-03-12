import { FormEvent, useEffect, useState } from "react";
import "./App.css";
import { Socket, io } from "socket.io-client";
import { Chatt } from "./models/Chatt";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMassages] = useState<Chatt[]>([]);
  const [massageName, setMassageName] = useState("");
  const [massageColor, setMassageColor] = useState("#000000");
  const [messageText, setMassageText] = useState("");

  useEffect(() => {
    if (socket) return;

    const s = io("http://localhost:3000");

    s.on("all_massage", (messages: Chatt[]) => {
      setMassages(messages);
    });
    s.on("add_massage", (message: Chatt[]) => {
      setMassages(message);
    });
    setSocket(s);
  }, [setSocket, socket]);
  const time = new Date().toTimeString();
  const oneMessage = (e: FormEvent) => {
    e.preventDefault();
    socket?.emit("new_massage", {
      userName: massageName,
      userColor: massageColor,
      chattMessage: messageText,
      time: time,
    });
  };
  console.log(messages);
  return (
    <>
      <form onSubmit={oneMessage}>
        <input
          className="form-control"
          type="text"
          value={massageName}
          onChange={(e) => setMassageName(e.target.value)}
          placeholder="Ditt namn"
        />
        <br />
        <input
          type="color"
          value={massageColor}
          onChange={(e) => setMassageColor(e.target.value)}
        />
        <br />
        <input
          className="form-control"
          onChange={(e) => setMassageText(e.target.value)}
          placeholder="Chatt medelande"
          type="text"
          value={messageText}
        ></input>
        <br />
        <button className="btn btn-primary">Skicka</button>
      </form>
      <div>
        {messages.map((msg, i) => {
          return (
            <div
              className="container text-center"
              key={i}
              style={{ backgroundColor: msg.userColor, color: "white" }}
            >
              <div className="row">
                <p className="col">
                  {msg.userName}: {msg.chattMessage}
                </p>
                <p className="col">{msg.time.slice(0, 8)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
