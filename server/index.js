const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

app.get('/api/quiz', (req, res) => {
  const questionsPath = path.join(__dirname, 'questions.json');
  fs.readFile(questionsPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to load questions.' });
    }
    let questions = JSON.parse(data);
    questions = shuffle(questions).slice(0, 10);
    // Format options for frontend
    questions = questions.map(q => ({
      question: q.question,
      options: q.options.map(opt => ({
        text: opt,
        isCorrect: opt === q.answer
      }))
    }));
    res.json(questions);
  });
});

app.listen(PORT, () => {
  console.log(`Quiz server running on port ${PORT}`);
});
