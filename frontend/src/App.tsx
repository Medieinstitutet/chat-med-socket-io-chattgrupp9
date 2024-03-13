import { FormEvent, useEffect, useState } from "react";
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
  const [massageColor, setMassageColor] = useState("#000000");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState("");

  useEffect(() => {
    if (socket) return;

    const s = io("http://localhost:3000");

    s.on("all_massage", (messages: Chatt[]) => {
      setMessages(messages);
    });
    s.on("all_rooms", (rooms: Room[]) => {
      setRooms(rooms);
    });
    s.on("edit_message_success", (message: Chatt[]) => {
      setMessages(message);
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
    setMassageText("");
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

  const handleEditSubmit = (index: number) => {
    if (editMessageText.trim() === "") return;
    const updatedMessages = [...messages];
    updatedMessages[index].chattMessage = editMessageText;
    setMessages(updatedMessages);
    setEditIndex(null);
    setEditMessageText("");
    if (socket) {
      socket.emit("edit_message", {
        index: index,
        newMessage: editMessageText,
      });
    }
  };

  console.log(messages);
  return (
    <>
      <select name='room'>
        <option value='Marcus'>Marcus</option>
        <option value='Erik'>Erik</option>
        <option value='Gustav'>Gustav</option>
      </select>
      <form onSubmit={oneMessage}>
        <input
          className='form-control'
          type='text'
          value={massageName}
          onChange={(e) => setMassageName(e.target.value)}
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
        <input
          type='color'
          value={massageColor}
          onChange={(e) => setMassageColor(e.target.value)}
        />
        <br />
        <input
          className='form-control'
          onChange={(e) => setMassageText(e.target.value)}
          placeholder='Chatt medelande'
          type='text'
          value={messageText}
        ></input>
        <br />
        <button className='btn btn-primary'>Skicka</button>
      </form>
      <div>
        {messages.map((msg, i) => {
          return (
            <div
              className='container text-center'
              key={i}
              style={{ backgroundColor: msg.userColor, color: "white" }}
            >
              <div className='row'>
                <p className='col'>
                  {msg.userName}: {msg.chattMessage}
                </p>
                <p className='col'>{msg.time.slice(0, 8)}</p>
                <button
                  onClick={() => {
                    setEditIndex(i);
                    setEditMessageText(msg.chattMessage);
                  }}
                >
                  Update
                </button>
              </div>
              {editIndex === i && (
                <div className='row'>
                  <input
                    type='text'
                    value={editMessageText}
                    onChange={(e) => setEditMessageText(e.target.value)}
                  />
                  <button onClick={() => handleEditSubmit(i)}>Save</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
