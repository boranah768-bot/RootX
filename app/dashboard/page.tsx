"use client";

import { useState } from "react";

type Message = {
  role: "user" | "rootx";
  text: string;
};

export default function Dashboard() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = message.trim();

    if (!text || loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Something went wrong.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "rootx",
          text: data.reply || "No response received.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "rootx",
          text:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Failed to connect to RootX AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "white",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "20px",
          borderBottom: "1px solid #222",
          fontSize: "22px",
          fontWeight: "bold",
        }}
      >
        RootX AI
      </header>

      {/* Chat */}
      <section
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "30px 20px 140px",
          boxSizing: "border-box",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "20vh",
              color: "#888",
            }}
          >
            <h1 style={{ color: "white" }}>RootX AI</h1>
            <p>Ask RootX anything.</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: "25px",
              display: "flex",
              justifyContent:
                msg.role === "user"
                  ? "flex-end"
                  : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "14px 18px",
                borderRadius: "16px",
                background:
                  msg.role === "user" ? "#ffffff" : "#151515",
                color:
                  msg.role === "user" ? "#000000" : "#ffffff",
                whiteSpace: "pre-wrap",
                lineHeight: 1.5,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              color: "#888",
              marginBottom: "20px",
            }}
          >
            RootX is thinking...
          </div>
        )}
      </section>

      {/* Input */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#050505",
          borderTop: "1px solid #222",
          padding: "15px",
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            gap: "10px",
          }}
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message RootX..."
            disabled={loading}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              padding: "15px",
              borderRadius: "14px",
              border: "1px solid #333",
              background: "#111",
              color: "white",
              outline: "none",
              fontSize: "16px",
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            style={{
              padding: "0 22px",
              borderRadius: "14px",
              border: "none",
              background:
                loading || !message.trim()
                  ? "#333"
                  : "white",
              color:
                loading || !message.trim()
                  ? "#888"
                  : "black",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}