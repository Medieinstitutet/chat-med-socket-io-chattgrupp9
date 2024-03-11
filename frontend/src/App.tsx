import { useEffect, useState } from "react";
import "./App.css";
import { Socket, io } from "socket.io-client";
import { Chatt } from "./models/Chatt";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Chatt[]>([]);
  const [massageName, setMessageName] = useState("");
  const [messageText, setMessageText] = useState("");
  useEffect(() => {
    if (socket) return;

    const s = io("http://localhost:3000");

    s.on("all_message", (messages: Chatt[]) => {
      setMessages(messages);
    });
    setSocket(s);
  }, [setSocket, socket]);

  const oneMessage = () => {
    socket?.emit("one_message", {
      userName: massageName,
      message: messageText,
    });
  };
  console.log(messages);
  return (
    <>
      <div>
        <input
          type="text"
          value={massageName}
          onChange={(e) => setMessageName(e.target.value)}
          placeholder="Ditt namn"
        />
        <br />
        <textarea
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Chatt medelande"
        ></textarea>
        <br />
        <button onClick={oneMessage}>Skicka</button>
      </div>
      <div>
        {messages.map((msg, i) => {
          return (
            <div key={i}>
              <p>
                {msg.userName}: {msg.chattMessage}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
