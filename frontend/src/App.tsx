import { useEffect, useState } from "react";
import "./App.css";
import { Socket, io } from "socket.io-client";
import { Chatt } from "./models/Chatt";
import { Room } from "./models/Room";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Chatt[]>([]);
  const [room, setRoom] = useState<Room>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [massageName, setMessageName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  useEffect(() => {
    if (socket) return;

    const s = io("http://localhost:3000");

    s.on("all_message", (messages: Chatt[]) => {
      setMessages(messages);
    });
    s.on("all_rooms", (rooms: Room[]) => {
      setRooms(rooms);
    });
    setSocket(s);
  }, [setSocket, socket]);

  const oneMessage = () => {
    socket?.emit("one_message", {
      userName: massageName,
      message: messageText,
    });
  };
  const handleClick = (selectedRoomId: string) => {
    const selectedRoom = rooms.find((room) => room.roomId === selectedRoomId);
    if (selectedRoom && socket) {
      socket.emit("join_room", selectedRoomId, (room: Room) => {
        console.log("Joined room: ", room);
        setRoom(room);
      });
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoomId = e.target.value;
    setSelectedRoomId(selectedRoomId);
    handleClick(selectedRoomId);
    console.log(handleSelectChange);
  };

  console.log(messages);
  return (
    <>
      <div>
        <input
          type='text'
          value={massageName}
          onChange={(e) => setMessageName(e.target.value)}
          placeholder='Ditt namn'
        />
        <br />
        <>
          <select value={selectedRoomId} onChange={handleSelectChange}>
            <option value=''>Select a room</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.roomName}
              </option>
            ))}
          </select>
          <div>
            <p>Du är i detta rum: {room ? room.roomName : "None"}</p>
          </div>
        </>
        <textarea
          onChange={(e) => setMessageText(e.target.value)}
          placeholder='Chatt medelande'
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
