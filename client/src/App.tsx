import { useState, useEffect } from "react";

type Option = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  question: string;
  options: Option[];
};

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/quiz");
      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      // Optionally handle error
    }
  };

  const handleAnswer = (opt: Option) => {
    setSelected(opt.text);
    setIsCorrect(opt.isCorrect);

    if (opt.isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex >= questions.length - 1) {
      setQuizFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
    }
  };

  const handleRestart = () => {
    fetchQuestions();
    setCurrentIndex(0);
    setSelected(null);
    setIsCorrect(null);
    setScore(0);
    setQuizFinished(false);
  };

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
        color: "black",
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
        <h1 style={{ marginBottom: "20px" }}>🎉 Quizzia 🎉</h1>

        {quizFinished ? (
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
              Restart Quiz
            </button>
          </div>
        ) : (
          questions.length > 0 && (
            <div>
              <h2 style={{ marginBottom: "15px" }}>
                {questions[currentIndex].question}
              </h2>
              <div>
                {questions[currentIndex].options.map((opt, idx) => {
                  const isSelected = selected === opt.text;
                  let bgColor = "#f0f0f0";
                  if (isSelected) {
                    bgColor = opt.isCorrect ? "#4caf50" : "#f44336"; // green or red
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt)}
                      disabled={selected !== null}
                      style={{
                        display: "block",
                        width: "100%",
                        margin: "8px 0",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "none",
                        cursor: selected ? "default" : "pointer",
                        backgroundColor: bgColor,
                        color: isSelected ? "white" : "black",
                        fontWeight: "bold",
                        transition: "0.3s",
                      }}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* {selected && (
                <p style={{ marginTop: "10px" }}>
                  {isCorrect ? "✅ Correct!" : "❌ Wrong!"}
                </p>
              )} */}

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
