import { useState, useEffect } from "react";
type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  question: string;
  options: Option[];
};

// Categories list for UI only
const categories: string[] = [
  "Planets",
  "Animals",
  "Math",
  "Science",
  "Sports",
];

// 👇 Add this line for backend API base URL
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [category, setCategory] = useState<string | null>(null);

  // ⏳ Timer state
  const [timeLeft, setTimeLeft] = useState(10);

  // 👇 Add loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions from server
  const loadQuestions = async (categoryName: string) => {
    setCategory(categoryName);
    setTimeLeft(10); // reset timer when quiz starts
    setQuestions([]); // clear previous questions
    setCurrentIndex(0);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setQuizFinished(false);
    setLoading(true);
    setError(null);

    try {
      // 👇 updated fetch to use API_BASE
      const res = await fetch(
        `${API_BASE}/api/quiz?category=${encodeURIComponent(categoryName)}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await res.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (err: any) {
      setQuestions([]);
      setLoading(false);
      setError("Could not load questions. Please check your server.");
    }
  };

  const handleAnswer = (opt: Option) => {
    setSelected(opt.text);
    setIsCorrect(opt.isCorrect);
    if (opt.isCorrect) setScore((prev) => prev + 1);
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setQuizFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
      setTimeLeft(10); // reset timer for next question
    }
  };

  const handleRestart = () => {
    setCategory(null);
    setCurrentIndex(0);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setQuizFinished(false);
    setTimeLeft(10); // reset timer
    setQuestions([]);
  };

  // ⏳ Countdown logic
  useEffect(() => {
    if (!category || quizFinished || !questions.length) return;

    if (timeLeft === 0) {
      handleNext(); // auto move if timer hits zero
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, category, quizFinished, questions, currentIndex]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "400px",
          color: "black",
        }}
      >
        <h1>🎉 Quizzia 🎉</h1>

        {/* Show error if exists */}
        {error && (
          <div style={{ color: "red", marginBottom: "16px" }}>
            {error}
            <button
              style={{
                marginLeft: "10px",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid #f44336",
                background: "#fff0f0",
                color: "#f44336",
                cursor: "pointer",
              }}
              onClick={() => {
                setCategory(null);
                setError(null);
              }}
            >
              Back
            </button>
          </div>
        )}

        {!category ? (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => loadQuestions(cat)}
                style={{
                  display: "inline-block",
                  width: "120px",
                  height: "120px",
                  margin: "10px",
                  borderRadius: "12px",
                  border: "2px solid #6c63ff",
                  backgroundColor: "#6c63ff",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "16px",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : loading ? (
          <div>
            <p>Loading questions...</p>
          </div>
        ) : quizFinished ? (
          <div>
            <h2>Quiz Finished!</h2>
            <p>
              Your Score: <strong>{score}</strong> / {questions.length}
            </p>
            <button
              onClick={handleRestart}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c63ff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Restart
            </button>
          </div>
        ) : (
          questions.length > 0 && (
            <div>
              {/* ⏳ Progress bar timer */}
              <div
                style={{
                  height: "15px",
                  width: "100%",
                  backgroundColor: "#ddd",
                  borderRadius: "8px",
                  overflow: "hidden",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(timeLeft / 10) * 100}%`,
                    backgroundColor: timeLeft > 3 ? "#4caf50" : "#f44336",
                    transition: "width 1s linear",
                  }}
                />
              </div>

              <h2>{questions[currentIndex].question}</h2>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {questions[currentIndex].options.map((opt, idx) => {
                  const isSelected = selected === opt.text;
                  let bgColor = "#f0f0f0";
                  if (isSelected) {
                    bgColor = opt.isCorrect ? "#4caf50" : "#f44336";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt)}
                      disabled={selected !== null}
                      style={{
                        margin: "8px 0",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: selected ? "default" : "pointer",
                        backgroundColor: bgColor,
                        color: isSelected ? "white" : "black",
                        fontWeight: "bold",
                        width: "80%",
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={selected === null}
                style={{
                  marginTop: "15px",
                  padding: "10px 20px",
                  backgroundColor: "#6c63ff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: selected ? "pointer" : "not-allowed",
                }}
              >
                Next
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
