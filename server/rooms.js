// server/rooms.js
const { v4: uuidv4 } = require("uuid");

const rooms = {}; // { roomId: { players: [] } }

function createRoom(hostName) {
  const roomId = uuidv4().slice(0, 6); // short code
  rooms[roomId] = { players: [{ name: hostName, score: 0 }] };
  return roomId;
}

function joinRoom(roomId, playerName) {
  if (!rooms[roomId]) return null;
  rooms[roomId].players.push({ name: playerName, score: 0 });
  return rooms[roomId];
}

function getRoom(roomId) {
  return rooms[roomId];
}

module.exports = { createRoom, joinRoom, getRoom };
