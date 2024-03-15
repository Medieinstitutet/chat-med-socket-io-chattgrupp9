import { FormEvent, useEffect, useState } from "react";
import "./App.css";
import { Socket, io } from "socket.io-client";
import { Room } from "./models/Room";

function App() {
  const [socket, setSocket] = useState<Socket>();
  const [room, setRoom] = useState<Room>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [massageName, setMessageName] = useState("");
  const [messageText, setMessageText] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [massageColor, setMassageColor] = useState("#000000");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);

  useEffect(() => {
    if (socket) return;

    const s = io("http://localhost:3000");

    s.on("all_rooms", (rooms: Room[]) => {
      setRooms(rooms);
    });

    s.on("all_massage", (messages: Room) => {
      setRoom(messages);
    });

    s.on("edit_message_success", (message: Room) => {
      setRoom(message);
    });
    setSocket(s);
  }, [setSocket, socket]);

  const time = new Date().toTimeString();
  const oneMessage = (e: FormEvent) => {
    e.preventDefault();
    socket?.emit("new_massage", {
      userName: massageName,
      chattID: room?.roomId,
      userColor: massageColor,
      chattMessage: messageText,
      time: time,
    });
    setMessageText("");
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

  const isUsernameExists = (massageName: string) => {
    return room?.Chatts.some((msg) => msg.userName === massageName);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setMessageName(newName);
    setIsUsernameUnique(!isUsernameExists(newName));
  };

  const handleNameCheck = () => {
    if (isUsernameExists(massageName)) {
      alert("Username already exists!");
    } else {
      alert("Username is unique!");
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
    const updatedMessages = [...(room?.Chatts ?? [])];
    updatedMessages[index].chattMessage = editMessageText;
    const updatedRoom = { ...room!, allMassage: updatedMessages };
    setRoom(updatedRoom);
    setEditIndex(null);
    setEditMessageText("");
    if (socket) {
      socket.emit("edit_message", {
        chattId: room?.roomId,
        index: index,
        newMessage: editMessageText,
      });
    }
  };

  return (
    <>
      <input
        className="form-control"
        type="text"
        value={massageName}
        onChange={handleNameChange}
        placeholder="Ditt namn"
      />
      <br />
      <button onClick={handleNameCheck}>Check Use name</button>
      <>
        <select
          value={selectedRoomId}
          disabled={!isUsernameUnique}
          onChange={handleSelectChange}
        >
          <option value="">Select a room</option>
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
      <div id="chatArea">
        {room && (
          <>
            <form onSubmit={oneMessage}>
              <input
                className="form-control"
                type="text"
                value={massageName}
                onChange={(e) => setMessageName(e.target.value)}
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
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Chatt medelande"
                type="text"
                value={messageText}
                disabled={!isUsernameUnique}
              ></input>
              <br />
              <button className="btn btn-primary">Skicka</button>
            </form>
            <p>{room.roomName}</p>
            <ul className="chat-body">
              {room.Chatts.map((chatt, i) => (
                <div
                  key={i}
                  className="message"
                  id={massageName === chatt.userName ? "you" : "other"}
                >
                  <li
                    style={{ backgroundColor: chatt.userColor, color: "white" }}
                    className="msg-list"
                  >
                    {chatt.userName} - {chatt.chattMessage}:{" "}
                    {chatt.time.slice(0, 9)}
                  </li>
                  <button
                    onClick={() => {
                      setEditIndex(i);
                      setEditMessageText(chatt.chattMessage);
                    }}
                    disabled={!massageName}
                  >
                    Update
                  </button>
                  {editIndex === i && (
                    <div className="row">
                      <input
                        type="text"
                        value={editMessageText}
                        onChange={(e) => setEditMessageText(e.target.value)}
                      />
                      <button onClick={() => handleEditSubmit(i)}>Save</button>
                    </div>
                  )}
                </div>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}

export default App;
