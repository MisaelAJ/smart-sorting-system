const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
// Alow cross-connections from front of vite
app.use(cors({ origin: "*" }));
app.use(express.json());

const server = http.createServer(app);
// Configure WebSockets
const io = new Server(server, {
  cors: { origin: "*" },
});

// ==========================================
// 1. API REST (To receive data from Python)
// ==========================================
app.post("/api/clasificacion", (req, res) => {
  const data = req.body;
  console.log("Visión detectó:", data);

  // Send to front-end web interface
  io.emit("nueva_clasificacion", data);

  // Here in the future we would send the command via Serial to the Arduino
  // serialPort.write(JSON.stringify({ cmd: "PICK", target: data.color }));

  res.status(200).json({ status: "recibido", data });
});

// ==========================================
// 2. WEBSOCKET CONNECTIONS (Frontend)
// ==========================================
io.on("connection", (socket) => {
  console.log("Frontend connected. ID:", socket.id);

  socket.on("disconnect", () => {
    console.log("Frontend disconnected");
  });
});

// ==========================================
// 3. MOCK DATA SIMULATOR (For development)
// ==========================================
// This simulates that the belt is operating and Python detects something every 5 seconds
setInterval(() => {
  const colores = ["rojo", "azul", "amarillo"];
  const formas = ["cubo", "cilindro", "prisma"];

  const mockData = {
    color: colores[Math.floor(Math.random() * colores.length)],
    forma: formas[Math.floor(Math.random() * formas.length)],
    timestamp: new Date().toLocaleTimeString(),
  };

  console.log("Simulating detection:", mockData);
  io.emit("nueva_clasificacion", mockData);
}, 5000);

// ==========================================
// SERVER START
// ==========================================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server and WebSockets running on port ${PORT}`);
});
