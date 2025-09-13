import { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./lobby.css";

const socket = io(import.meta.env.VITE_APP_API_URL || "http://localhost:5000");

type Player = { name: string; score: number };
type Room = {
  host: string;
  players: Player[];
  started: boolean;
  category: string | null;
  questions: any[];
};

type LobbyProps = {
  onStartGame: (roomData: any, playerName: string) => void;
};

export default function Lobby({ onStartGame }: LobbyProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [category, setCategory] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    socket.on("room_update", (room: Room) => {
      console.log("DEBUG: room_update received in Lobby:", room);
      setPlayers(room.players || []);
    });

    socket.on("game_started", (roomData: any) => {
      console.log("DEBUG: game_started received in Lobby:", roomData);
      console.log("DEBUG: Forwarding to App with playerName:", playerName);
      onStartGame(roomData, playerName);
    });

    return () => {
      socket.off("room_update");
      socket.off("game_started");
    };
  }, [playerName, onStartGame]);


  const handleCreateRoom = async () => {
    if (!playerName.trim()) return alert("Enter your name first!");
    const res = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/api/room`,
      { name: playerName }
    );
    const newRoomId = (res.data as { roomId: string }).roomId;
    setRoomId(newRoomId);
    setIsHost(true);
    socket.emit("join_room", { roomId: newRoomId, name: playerName });
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) return alert("Enter your name first!");
    if (!joinCode.trim()) return alert("Enter a room code!");
    const res = await axios.post(
      `${import.meta.env.VITE_APP_API_URL}/api/room/${joinCode}/join`,
      { name: playerName }
    );
    const joinedRoomId = (res.data as { roomId: string }).roomId;
    setRoomId(joinedRoomId);
    setIsHost(false);
    socket.emit("join_room", { roomId: joinedRoomId, name: playerName });
  };

  const handleStartGame = () => {
    if (roomId && category) {
      socket.emit("start_game", { roomId, category });
    } else {
      alert("Select a category first!");
    }
  };

  return (
    <div className="lobby-container">
      {!roomId ? (
        <>
          <h2 className="lobby-title">Quizzia Lobby</h2>
          <input
            className="input-field"
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <div>
            <button className="button" onClick={handleCreateRoom}>
              Create Room
            </button>
            <input
              className="input-field"
              type="text"
              placeholder="Enter Room Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button className="button" onClick={handleJoinRoom}>
              Join
            </button>
          </div>
        </>
      ) : (
        <>
          <h2>Room: {roomId}</h2>
          <p>You are: <strong>{playerName}</strong></p>
          <h3>Players:</h3>
          <ul>
            {players.map((p, i) => (
              <li key={i}>{p.name}</li>
            ))}
          </ul>
          {isHost && (
            <>
              <h3>Select a Category</h3>
              <div className="category-grid">
                {["animals", "math", "planets", "science", "sports"].map(
                  (cat) => (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`category-card ${category === cat ? "active" : ""}`}
                    >
                      {cat}
                    </div>
                  )
                )}
              </div>
              <button className="button" onClick={handleStartGame} disabled={!category}>
                Start Game
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
