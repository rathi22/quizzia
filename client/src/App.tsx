import { useState } from "react";
import Lobby from "./components/lobby";
import Quiz from "./components/quiz";
import "./App.css";

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState("");

  return (
    <div>
      {!gameStarted ? (
        <Lobby
          onStartGame={(roomData, playerName) => {
            console.log("DEBUG: onStartGame in App called");
            console.log("DEBUG: roomData passed into App:", roomData);
            console.log("DEBUG: playerName passed into App:", playerName);

            setRoomData(roomData);
            setRoomId(roomData.roomId);
            setPlayerName(playerName);
            setGameStarted(true);

            console.log("DEBUG: State after setting in App:", {
              roomId: roomData.roomId,
              playerName,
              roomData,
            });
          }}
        />
      ) : (
        <Quiz
          roomId={roomId!}
          roomData={roomData}
          playerName={playerName}
          onExit={() => {
            console.log("DEBUG: Exiting quiz, resetting state");
            setGameStarted(false);
            setRoomData(null);
            setRoomId(null);
            setPlayerName("");
          }}
        />
      )}

    </div>
  );
}
