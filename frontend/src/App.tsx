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
  const [isUsernameUnique, setIsUsernameUnique] = useState(false);

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

  const isUsernameExists = () => {
    socket?.emit("check_username", massageName, (isUnique: boolean) => {
      setIsUsernameUnique(isUnique);

      if (isUnique) {
        socket?.emit("set_username", massageName);
      } else {
        alert("Username already exists!");
      }
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    socket?.emit("set_username");
    const newName = e.target.value;
    setMessageName(newName);
    if (newName === "") {
      alert("Please enter your name!");
    }
  };

  const handleNameCheck = () => {
    isUsernameExists();
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

  console.log(room?.Chatts.length);
  return (
    <>
      <div className='App'>
        <div className='chat-window'>
          <div className='chat-header'>
            <p>Live Chat</p>
          </div>
          <input
            className='form-control'
            type='text'
            value={massageName}
            onChange={handleNameChange}
            placeholder='Ditt namn'
          />
          <br />
          <button onClick={handleNameCheck}>Kontrollera användarnamn</button>
          {isUsernameUnique && (
            <>
              <select
                value={selectedRoomId}
                disabled={!isUsernameUnique}
                onChange={handleSelectChange}
              >
                <option value=''>Select a room</option>
                {rooms.map((room) => (
                  <option key={room.roomId} value={room.roomId}>
                    {room.roomName}
                  </option>
                ))}
              </select>
              <div>
                {room && (
                  <>
                    <form onSubmit={oneMessage}>
                      <br />
                      <input
                        type='color'
                        value={massageColor}
                        onChange={(e) => setMassageColor(e.target.value)}
                      />
                      <br />
                      <input
                        disabled={!isUsernameUnique}
                        className='form-control'
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder='Chatt medelande'
                        type='text'
                        value={messageText}
                      ></input>
                      <br />
                      <button
                        disabled={!isUsernameUnique}
                        className='btn btn-primary'
                      >
                        Skicka
                      </button>
                    </form>
                    <div className='chat-body'>
                      <div className='message-container'>
                        {room.Chatts.map((chatt, i) => (
                          <div
                            className='message'
                            key={i}
                            style={{
                              backgroundColor: chatt.userColor,
                              color: "white",
                            }}
                            id={
                              massageName === chatt.userName ? "you" : "other"
                            }
                          >
                            <div>
                              <div className='message-content'>
                                <p>{chatt.chattMessage}</p>
                              </div>
                              <div className='message-meta'>
                                <p id='time'>{chatt.time.slice(0, 9)}</p>
                                <p id='author'>{chatt.userName}</p>
                              </div>
                            </div>
                            <div className='chat-footer'>
                              <button
                                onClick={() => {
                                  setEditIndex(i);
                                  setEditMessageText(chatt.chattMessage);
                                }}
                              >
                                &#10002;
                              </button>
                              {editIndex === i && (
                                <div className='row'>
                                  <input
                                    type='text'
                                    value={editMessageText}
                                    onChange={(e) =>
                                      setEditMessageText(e.target.value)
                                    }
                                  />
                                  <button onClick={() => handleEditSubmit(i)}>
                                    Save
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}{" "}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
