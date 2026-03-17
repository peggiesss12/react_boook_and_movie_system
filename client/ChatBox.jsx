import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ChatBox() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);

  const API_URL = "http://localhost:5000";

  // fetch history
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_URL}/history`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const askAI = async () => {
    if (!prompt) return;

    const userMessage = { type: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post(`${API_URL}/recommend`, {
        prompt,
      });

      const aiMessage = {
        type: "ai",
        text: res.data.response || res.data,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setPrompt("");

      fetchHistory();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto" }}>
      <h2>AI Recommender 🤖</h2>

      {/* Chat Box */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: 10,
          height: 300,
          overflowY: "scroll",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.type === "user" ? "right" : "left",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                background: msg.type === "user" ? "#007bff" : "#eee",
                color: msg.type === "user" ? "#fff" : "#000",
                padding: 8,
                borderRadius: 8,
                display: "inline-block",
                maxWidth: "70%",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for movies or books..."
          style={{ width: "70%", padding: 10 }}
        />
        <button onClick={askAI} style={{ padding: 10 }}>
          Send
        </button>
      </div>

      {/* History */}
      <div style={{ marginTop: 20 }}>
        <h3>Previous Searches</h3>
        {history.map((item, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <strong>Q:</strong> {item.prompt}
          </div>
        ))}
      </div>
    </div>
  );
}