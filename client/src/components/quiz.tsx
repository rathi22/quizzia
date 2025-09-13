import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./quiz.css";

const socket = io(import.meta.env.VITE_APP_API_URL || "http://localhost:5000");

type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  question: string;
  options: Option[];
};

type QuizProps = {
  roomId: string;
  roomData: {
    category: string;
    questions: Question[];
    players: { name: string; score: number }[];
  };
  playerName: string;
  onExit: () => void;
};

export default function Quiz({ roomId, roomData, playerName, onExit }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ name: string; score: number }[]>([]);

  console.log("DEBUG: roomData in Quiz:", roomData);
  console.log("DEBUG: roomData.questions in Quiz:", roomData?.questions);

  const questions = roomData?.questions || [];
  const totalQuestions = questions.length;

  useEffect(() => {
    socket.on("leaderboard_update", (data: { name: string; score: number }[]) => {
      console.log("DEBUG: leaderboard_update received:", data);
      setLeaderboard(data);
    });

    return () => {
      socket.off("leaderboard_update");
    };
  }, []);

  useEffect(() => {
    if (showLeaderboard) return;
    if (timeLeft <= 0) {
      handleAnswer(false);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, showLeaderboard]);

  const handleAnswer = (isCorrect: boolean) => {
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    socket.emit("update_score", { roomId, name: playerName, score: newScore });

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(15);
    } else {
      socket.emit("finish_quiz", { roomId, name: playerName, score: newScore });
      setShowLeaderboard(true);
    }
  };

  if (!questions.length) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <p>⚠️ No questions found. Check server logs and payload.</p>
        </div>
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <div className="quiz-container">
        <div className="quiz-card">
          <h2 className="leaderboard-title">🏆 Final Leaderboard</h2>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={2}>Waiting for scores...</td>
                </tr>
              ) : (
                leaderboard
                  .sort((a, b) => b.score - a.score)
                  .map((p, i) => (
                    <tr key={i} className={p.name === playerName ? "highlight-row" : ""}>
                      <td>{p.name}</td>
                      <td>{p.score}</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
          <button onClick={onExit} className="exit-btn">
            Exit
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2 className="room-info">Room: {roomId}</h2>
        <p className="player-info">
          You are: <strong>{playerName}</strong>
        </p>
        <p className="category-info">Category: {roomData.category}</p>

        <div className="question-progress">
          Question {currentIndex + 1} of {totalQuestions}
        </div>

        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          ></div>
        </div>

        <h3 className="question-text">{currentQ.question}</h3>

        <div className="options-grid">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.isCorrect)}
              className="option-btn"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
