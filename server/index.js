import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// In-memory storage
const rooms = {};

// Utility: shuffle
function shuffleArray(arr) {
  return arr
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

// Utility: load questions
function loadQuestions(category) {
  try {
    const filePath = path.join(__dirname, "data", `${category}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    return shuffleArray(JSON.parse(data));
  } catch (err) {
    console.error(`❌ Error loading questions for ${category}:`, err);
    return [];
  }
}

// --- Create Room ---
app.post("/api/room", (req, res) => {
  const { name } = req.body;
  const roomId = uuidv4().slice(0, 6).toUpperCase();

  rooms[roomId] = {
    host: name,
    players: [{ name, score: 0 }],
    started: false,
    category: null,
    questions: [],
  };

  res.json({ roomId });
});

// --- Join Room ---
app.post("/api/room/:roomId/join", (req, res) => {
  const { roomId } = req.params;
  const { name } = req.body;

  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }

  rooms[roomId].players.push({ name, score: 0 });
  res.json({ roomId });
});

// --- Socket.io ---
io.on("connection", (socket) => {
  console.log("🔌 User connected", socket.id);

  socket.on("join_room", ({ roomId, name }) => {
    socket.join(roomId);
    if (rooms[roomId]) {
      io.to(roomId).emit("room_update", rooms[roomId]);
    }
  });

  socket.on("start_game", ({ roomId, category }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.started = true;
    room.category = category;

    // shuffle and take only first 10
    const allQuestions = loadQuestions(category);
    room.questions = allQuestions.slice(0, 10);

    console.log(`✅ Selected ${room.questions.length} questions for ${category}`);

    const payload = {
      roomId,
      category: room.category,
      players: room.players,
      questions: room.questions,
    };

    io.to(roomId).emit("game_started", payload);
  });


  socket.on("update_score", ({ roomId, name, score }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find((p) => p.name === name);
    if (player) player.score = score;
    io.to(roomId).emit("leaderboard_update", room.players);
  });

  socket.on("finish_quiz", ({ roomId, name, score }) => {
    const room = rooms[roomId];
    if (!room) return;
    const player = room.players.find((p) => p.name === name);
    if (player) player.score = score;
    io.to(roomId).emit("leaderboard_update", room.players);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
