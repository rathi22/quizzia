const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors()); 

// Utility to shuffle array
function shuffleArray(arr) {
  return arr
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Supported categories and their data files
const categoryFiles = {
  Planets: "planets.json",
  Animals: "animals.json",
  Math: "math.json",
  Science: "science.json",
  Sports: "sports.json",
};

// API endpoint to get quiz questions
app.get("/api/quiz", (req, res) => {
  const category = req.query.category;
  if (!category || !categoryFiles[category]) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const filePath = path.join(__dirname, "data", categoryFiles[category]);
  let rawData;
  try {
    rawData = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    return res.status(500).json({ error: "Could not load questions" });
  }

  // Format and shuffle questions
  const formatted = rawData.map((q) => ({
    question: q.question,
    options: shuffleArray(
      q.options.map((opt) => ({
        text: opt,
        isCorrect: opt === q.answer,
      }))
    ),
  }));

  const questions = shuffleArray(formatted).slice(0, 10);

  res.json({ questions });
});

// Serve static files if needed (for deployment)
// app.use(express.static(path.join(__dirname, "../client/build")));

app.listen(PORT, () => {
  console.log(`Quiz server running on port ${PORT}`);
});
