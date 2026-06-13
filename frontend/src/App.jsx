import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Conectar al backend expuesto por Docker
const socket = io("http://localhost:3000");

function App() {
  const [lastPiece, setLastPiece] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Listen to connection status
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Listen to the event we configured in Node.js
    socket.on("nueva_clasificacion", (data) => {
      setLastPiece(data);
      // Add to the beginning of the history keeping only the last 5
      setHistory((prev) => [data, ...prev].slice(0, 5));
    });

    // Clean up subscriptions on unmount
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("nueva_clasificacion");
    };
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Smart Sorting System 🤖</h1>

      <div
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          borderRadius: "50px",
          backgroundColor: connected ? "#d4edda" : "#f8d7da",
          color: connected ? "#155724" : "#721c24",
          marginBottom: "2rem",
        }}
      >
        Backend Status: {connected ? "🟢 Online" : "🔴 Offline"}
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Last Piece Panel */}
        <div
          style={{
            flex: 1,
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>Last Piece Detected</h2>
          {lastPiece ? (
            <div>
              <p>
                <strong>Color:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {lastPiece.color}
                </span>
              </p>
              <p>
                <strong>Forma:</strong>{" "}
                <span style={{ textTransform: "capitalize" }}>
                  {lastPiece.forma}
                </span>
              </p>
              <p>
                <strong>Time:</strong> {lastPiece.timestamp}
              </p>
            </div>
          ) : (
            <p>Waiting for camera detections...</p>
          )}
        </div>

        {/* History Panel */}
        <div
          style={{
            flex: 1,
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <h2>Recent History</h2>
          <ul>
            {history.map((item, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                {item.timestamp} - {item.forma} {item.color}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
