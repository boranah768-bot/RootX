"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

type Role = "user" | "rootx";

type Message = {
  id: string;
  role: Role;
  text: string;
};

type Chat = {
  id: string;
  title: string;
  messages: Message[];
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
};

type Section = "recent" | "pinned" | "library";

export default function Dashboard() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<Section>("recent");

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  /* LOAD CHATS */

  useEffect(() => {
    try {
      const saved = localStorage.getItem("rootx_chats");

      if (!saved) return;

      const data = JSON.parse(saved);

      if (Array.isArray(data)) {
        setChats(data);

        if (data.length > 0) {
          const sorted = [...data].sort(
            (a: Chat, b: Chat) => b.updatedAt - a.updatedAt
          );

          setActiveChatId(sorted[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  }, []);

  /* SAVE CHATS */

  useEffect(() => {
    try {
      localStorage.setItem("rootx_chats", JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to save chats:", error);
    }
  }, [chats]);

  /* CLEANUP VOICE */

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}

      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  /* AUTO SCROLL */

  useEffect(() => {
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [chats, activeChatId, loading]);

  /* ACTIVE CHAT */

  const activeChat = chats.find(
    (chat) => chat.id === activeChatId
  );

  const messages = activeChat?.messages ?? [];

  /* FILTERED CHATS */

  const filteredChats = useMemo(() => {
    let result = [...chats];

    if (section === "pinned") {
      result = result.filter((chat) => chat.pinned);
    }

    result.sort((a, b) => b.updatedAt - a.updatedAt);

    if (search.trim()) {
      const q = search.toLowerCase().trim();

      result = result.filter((chat) => {
        return (
          chat.title.toLowerCase().includes(q) ||
          chat.messages.some((msg) =>
            msg.text.toLowerCase().includes(q)
          )
        );
      });
    }

    return result;
  }, [chats, section, search]);

  /* NEW CHAT */

  const newChat = () => {
    stopSpeaking();

    setActiveChatId(null);
    setMessage("");
    setSearch("");
    setSection("recent");
    setSidebarOpen(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /* CREATE CHAT */

  const getChatId = (text: string) => {
    if (
      activeChatId &&
      chats.some((chat) => chat.id === activeChatId)
    ) {
      return activeChatId;
    }

    const id = crypto.randomUUID();
    const now = Date.now();

    const chat: Chat = {
      id,
      title:
        text.length > 40
          ? text.slice(0, 40) + "..."
          : text,
      messages: [],
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };

    setChats((prev) => [chat, ...prev]);
    setActiveChatId(id);

    return id;
  };

  /* STOP VOICE OUTPUT */

  const stopSpeaking = () => {
    if (typeof window === "undefined") return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setSpeaking(false);
  };

  /* ROOTX VOICE OUTPUT */

  const speakResponse = (text: string) => {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/```[\s\S]*?```/g, "Code omitted.")
      .replace(/[*_#`]/g, "")
      .trim();

    if (!cleanText) return;

    const utterance =
      new SpeechSynthesisUtterance(cleanText);

    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  /* VOICE INPUT */

  const startVoiceInput = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {}

      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = "en-IN";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript +=
            event.results[i][0].transcript;
        }

        setMessage(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error(
          "Voice recognition error:",
          event.error
        );

        setListening(false);

        if (event.error === "not-allowed") {
          alert(
            "Microphone permission was denied. Please allow microphone access for RootX."
          );
        }
      };

      recognition.onend = () => {
        setListening(false);

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      };

      recognitionRef.current = recognition;

      recognition.start();
    } catch (error) {
      console.error(
        "Could not start voice recognition:",
        error
      );

      setListening(false);
    }
  };

  /* SEND MESSAGE */

  const sendMessage = async () => {
    const text = message.trim();

    if (!text || loading) return;

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {}

      setListening(false);
    }

    const chatId = getChatId(text);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text,
    };

    setMessage("");

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;

        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          updatedAt: Date.now(),
        };
      })
    );

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

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Request failed: ${response.status}`
        );
      }

      const reply =
        data?.reply ??
        data?.message ??
        data?.text ??
        data?.content;

      if (!reply) {
        throw new Error(
          "The API returned an empty response."
        );
      }

      const rootxMessage: Message = {
        id: crypto.randomUUID(),
        role: "rootx",
        text: String(reply),
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          return {
            ...chat,
            messages: [
              ...chat.messages,
              rootxMessage,
            ],
            updatedAt: Date.now(),
          };
        })
      );

      /* SPEAK ROOTX RESPONSE */

      speakResponse(String(reply));
    } catch (error) {
      console.error("RootX API error:", error);

      const errorText =
        error instanceof Error
          ? error.message
          : "Unknown error";

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "rootx",
        text:
          "I couldn't connect to the AI service.\n\n" +
          `Error: ${errorText}`,
      };

      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== chatId) return chat;

          return {
            ...chat,
            messages: [
              ...chat.messages,
              errorMessage,
            ],
            updatedAt: Date.now(),
          };
        })
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  /* ENTER */

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      void sendMessage();
    }
  };

  /* OPEN CHAT */

  const openChat = (id: string) => {
    stopSpeaking();

    setActiveChatId(id);
    setMessage("");
    setSidebarOpen(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /* PIN */

  const togglePin = (id: string) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === id
          ? {
              ...chat,
              pinned: !chat.pinned,
            }
          : chat
      )
    );
  };

  /* DELETE */

  const deleteChat = (id: string) => {
    const remaining = chats.filter(
      (chat) => chat.id !== id
    );

    setChats(remaining);

    if (activeChatId === id) {
      const sorted = [...remaining].sort(
        (a, b) => b.updatedAt - a.updatedAt
      );

      setActiveChatId(
        sorted.length > 0
          ? sorted[0].id
          : null
      );
    }
  };

  /* LOGOUT */

  const logout = async () => {
    stopSpeaking();

    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <main className="rootx">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR BUTTON */}

      <button
        className="logoButton"
        type="button"
        onClick={() =>
          setSidebarOpen((v) => !v)
        }
      >
        <img
          src="/logo.png"
          alt="RootX"
        />
      </button>

      {/* SIDEBAR */}

      <aside
        className={`sidebar ${
          sidebarOpen
            ? "sidebarOpen"
            : ""
        }`}
      >

        <div className="brand">

          <img
            src="/logo.png"
            alt="RootX"
          />

          <div>
            <div className="brandName">
              ROOTX
            </div>

            <div className="brandSub">
              AI WORKSPACE
            </div>
          </div>

        </div>

        <button
          type="button"
          className="newChat"
          onClick={newChat}
        >
          + New Chat
        </button>

        <input
          className="searchInput"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSection("recent");
          }}
          placeholder="Search chats..."
        />

        <div className="menu">

          <button
            type="button"
            className={
              search
                ? "menuActive"
                : ""
            }
            onClick={() =>
              setSection("recent")
            }
          >
            ⌕ Search Chats
          </button>

          <button
            type="button"
            className={
              section === "pinned"
                ? "menuActive"
                : ""
            }
            onClick={() => {
              setSection("pinned");
              setSearch("");
            }}
          >
            ★ Pinned Chats
          </button>

          <button
            type="button"
            className={
              section === "recent"
                ? "menuActive"
                : ""
            }
            onClick={() => {
              setSection("recent");
              setSearch("");
            }}
          >
            ◷ Recent
          </button>

          <button
            type="button"
            className={
              section === "library"
                ? "menuActive"
                : ""
            }
            onClick={() => {
              setSection("library");
              setSearch("");
            }}
          >
            ▣ Library
          </button>

        </div>

        <div className="history">

          <div className="historyTitle">

            {search
              ? "SEARCH RESULTS"
              : section === "pinned"
              ? "PINNED CHATS"
              : section === "library"
              ? "LIBRARY"
              : "RECENT CHATS"}

          </div>

          {filteredChats.length === 0 ? (

            <div className="emptyHistory">
              {search
                ? "No chats found."
                : "No saved chats yet."}
            </div>

          ) : (

            filteredChats.map((chat) => (

              <ChatItem
                key={chat.id}
                chat={chat}
                active={
                  chat.id === activeChatId
                }
                onOpen={() =>
                  openChat(chat.id)
                }
                onPin={() =>
                  togglePin(chat.id)
                }
                onDelete={() =>
                  deleteChat(chat.id)
                }
              />

            ))

          )}

        </div>

        <div className="account">

          <div className="accountName">
            RootX User
          </div>

          <div className="accountRole">
            AI Developer
          </div>

          <button
            type="button"
            className="logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN AREA */}

      <section className="content">

        <div className="messages">

          {messages.length === 0 ? (

            <Welcome />

          ) : (

            <>
              {messages.map((msg) => (

                <MessageBubble
                  key={msg.id}
                  message={msg}
                />

              ))}

              {loading && <Typing />}

              <div ref={bottomRef} />

            </>

          )}

        </div>

        {/* INPUT */}

        <div className="inputArea">

          <div className="inputBox">

            <textarea
              ref={inputRef}
              value={message}
              disabled={loading}
              rows={1}
              placeholder={
                listening
                  ? "Listening..."
                  : "Message RootX..."
              }
              onChange={(e) => {

                setMessage(
                  e.target.value
                );

                e.currentTarget.style.height =
                  "auto";

                e.currentTarget.style.height =
                  `${Math.min(
                    e.currentTarget
                      .scrollHeight,
                    160
                  )}px`;
              }}
              onKeyDown={handleKeyDown}
            />

            {/* MICROPHONE */}

            <button
              type="button"
              className={`voiceButton ${
                listening
                  ? "voiceActive"
                  : ""
              }`}
              onClick={startVoiceInput}
              disabled={loading}
              title={
                listening
                  ? "Stop listening"
                  : "Speak to RootX"
              }
            >
              {listening
                ? "⏹"
                : "🎤"}
            </button>

            {/* SEND */}

            <button
              type="button"
              disabled={
                loading ||
                !message.trim()
              }
              onClick={() =>
                void sendMessage()
              }
            >
              {loading
                ? "..."
                : "Send"}
            </button>

          </div>

          <div className="disclaimer">

            {speaking ? (

              <button
                type="button"
                className="stopVoice"
                onClick={stopSpeaking}
              >
                🔊 RootX is speaking · Stop
              </button>

            ) : listening ? (

              <span className="listeningText">
                🎤 Listening... Speak now
              </span>

            ) : (

              <>
                🎤 Speak to RootX · ⌨️ Enter
                to send · Shift + Enter
                for a new line
              </>

            )}

          </div>

        </div>

      </section>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .rootx {
          width: 100%;
          height: 100vh;
          background: #090909;
          color: #fff;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
          overflow: hidden;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(
            0,
            0,
            0,
            0.65
          );
          z-index: 40;
        }

        .logoButton {
          position: fixed;
          top: 18px;
          left: 18px;
          width: 48px;
          height: 48px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          z-index: 100;
        }

        .logoButton img {
          width: 48px;
          height: 48px;
          object-fit: cover;
          border-radius: 14px;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: -320px;
          width: 300px;
          height: 100vh;
          padding: 24px;
          background: #111;
          border-right: 1px solid #252525;
          display: flex;
          flex-direction: column;
          transition:
            left 0.25s ease;
          z-index: 90;
        }

        .sidebarOpen {
          left: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .brand img {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          object-fit: cover;
        }

        .brandName {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 3px;
        }

        .brandSub {
          color: #666;
          font-size: 10px;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        .newChat {
          width: 100%;
          padding: 13px;
          border: 0;
          border-radius: 11px;
          background: #fff;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 16px;
        }

        .searchInput {
          width: 100%;
          padding: 11px 12px;
          background: #181818;
          border: 1px solid #2b2b2b;
          border-radius: 10px;
          color: #fff;
          outline: none;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .menu {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .menu button {
          width: 100%;
          padding: 10px 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #999;
          text-align: left;
          font-size: 13px;
          cursor: pointer;
        }

        .menu button:hover,
        .menuActive {
          background: #1f1f1f !important;
          color: #fff !important;
        }

        .history {
          flex: 1;
          overflow-y: auto;
          margin-top: 24px;
          padding-right: 3px;
        }

        .historyTitle {
          color: #666;
          font-size: 10px;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }

        .emptyHistory {
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }

        .chatItem {
          display: flex;
          align-items: center;
          gap: 2px;
          margin-bottom: 4px;
          border-radius: 9px;
        }

        .chatItemActive {
          background: #1d1d1d;
        }

        .chatOpen {
          flex: 1;
          min-width: 0;
          padding: 10px;
          border: 0;
          background: transparent;
          color: #aaa;
          text-align: left;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          font-size: 13px;
        }

        .chatItemActive .chatOpen {
          color: #fff;
        }

        .chatAction {
          width: 28px;
          height: 28px;
          border: 0;
          background: transparent;
          color: #555;
          cursor: pointer;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .chatAction:hover {
          background: #292929;
          color: #fff;
        }

        .pinned {
          color: #fff;
        }

        .account {
          border-top: 1px solid #252525;
          padding-top: 17px;
          margin-top: 15px;
        }

        .accountName {
          font-size: 14px;
          font-weight: 600;
        }

        .accountRole {
          color: #777;
          font-size: 12px;
          margin-top: 3px;
        }

        .logout {
          width: 100%;
          padding: 10px;
          margin-top: 13px;
          background: transparent;
          border: 1px solid #333;
          border-radius: 9px;
          color: #aaa;
          cursor: pointer;
        }

        .logout:hover {
          color: #fff;
          border-color: #555;
        }

        .content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .messages {
          width: 900px;
          max-width: 94%;
          flex: 1;
          overflow-y: auto;
          padding-top: 85px;
          padding-bottom: 20px;
          scrollbar-width: thin;
        }

        .inputArea {
          width: 900px;
          max-width: 94%;
          padding: 10px 0 20px;
        }

        .inputBox {
          display: flex;
          align-items: flex-end;
          gap: 9px;
          padding: 8px;
          background: #151515;
          border: 1px solid #303030;
          border-radius: 18px;
        }

        .inputBox textarea {
          flex: 1;
          min-height: 48px;
          max-height: 160px;
          resize: none;
          overflow-y: auto;
          padding: 14px 12px;
          background: transparent;
          border: 0;
          outline: 0;
          color: #fff;
          font-family: inherit;
          font-size: 15px;
          line-height: 1.5;
        }

        .inputBox textarea::placeholder {
          color: #666;
        }

        .inputBox button {
          height: 48px;
          padding: 0 20px;
          border: 0;
          border-radius: 12px;
          background: #fff;
          color: #000;
          font-weight: 700;
          cursor: pointer;
          flex-shrink: 0;
        }

        .inputBox button:disabled {
          background: #333;
          color: #777;
          cursor: not-allowed;
        }

        .voiceButton {
          width: 48px !important;
          height: 48px !important;
          padding: 0 !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          background: #1b1b1b !important;
          color: #fff !important;
          cursor: pointer;
          flex-shrink: 0;
          font-size: 18px;
        }

        .voiceButton:hover {
          background: #252525 !important;
        }

        .voiceActive {
          background: #8cff00 !important;
          color: #000 !important;
          border-color: #8cff00 !important;
        }

        .disclaimer {
          color: #555;
          text-align: center;
          font-size: 11px;
          margin-top: 8px;
          min-height: 16px;
        }

        .stopVoice {
          background: transparent;
          border: 0;
          color: #8cff00;
          cursor: pointer;
          font-size: 11px;
        }

        .listeningText {
          color: #8cff00;
        }

        @media (max-width: 600px) {

          .sidebar {
            width: 285px;
          }

          .messages {
            max-width: 92%;
            padding-top: 78px;
          }

          .inputArea {
            max-width: 92%;
          }

          .inputBox {
            gap: 6px;
          }

          .inputBox textarea {
            font-size: 14px;
          }

          .inputBox button {
            padding: 0 15px;
          }

          .voiceButton {
            width: 46px !important;
            min-width: 46px;
          }

        }

      `}</style>

    </main>
  );
}

/* WELCOME */

function Welcome() {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 10px",
      }}
    >

      <img
        src="/logo.png"
        alt="RootX"
        style={{
          width: 90,
          height: 90,
          borderRadius: 24,
          objectFit: "cover",
          marginBottom: 22,
        }}
      />

      <h1
        style={{
          margin: "0 0 12px",
          fontSize:
            "clamp(30px, 5vw, 48px)",
        }}
      >
        Welcome to RootX
      </h1>

      <p
        style={{
          margin: 0,
          color: "#777",
          fontSize: 14,
        }}
      >
        Your AI assistant for coding,
        security and research.
      </p>

    </div>
  );
}

/* MESSAGE */

function MessageBubble({
  message,
}: {
  message: Message;
}) {
  const user =
    message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: user
          ? "flex-end"
          : "flex-start",
        marginBottom: 28,
        width: "100%",
      }}
    >

      <div
        style={{
          maxWidth: user
            ? "75%"
            : "100%",
          width: user
            ? "auto"
            : "100%",
        }}
      >

        {!user && (

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 8,
            }}
          >

            <img
              src="/logo.png"
              alt="RootX"
              style={{
                width: 27,
                height: 27,
                borderRadius: 8,
                objectFit: "cover",
              }}
            />

            <strong
              style={{
                fontSize: 13,
              }}
            >
              RootX
            </strong>

          </div>

        )}

        <div
          style={{
            background: user
              ? "#fff"
              : "transparent",
            color: user
              ? "#000"
              : "#e7e7e7",
            borderRadius: user
              ? 18
              : 8,
            padding: user
              ? "12px 16px"
              : 0,
            lineHeight: 1.7,
            fontSize: 15,
            wordBreak:
              "break-word",
          }}
        >
          <FormattedText
            text={message.text}
          />
        </div>

      </div>

    </div>
  );
}

/* FORMAT TEXT */

function FormattedText({
  text,
}: {
  text: string;
}) {
  const parts = text.split(
    /(```[\s\S]*?```)/g
  );

  return (
    <div>

      {parts.map(
        (part, index) => {

          if (
            part.startsWith("```")
          ) {

            const content =
              part.slice(3, -3);

            const lines =
              content.split("\n");

            let language = "";
            let code = content;

            if (
              lines.length > 0 &&
              /^[a-zA-Z0-9_+#.-]+$/.test(
                lines[0].trim()
              )
            ) {
              language =
                lines[0].trim();

              code =
                lines
                  .slice(1)
                  .join("\n");
            }

            return (
              <CodeBlock
                key={index}
                code={code}
                language={language}
              />
            );
          }

          return (
            <div
              key={index}
              style={{
                whiteSpace:
                  "pre-wrap",
                marginBottom:
                  index <
                  parts.length - 1
                    ? 12
                    : 0,
              }}
            >
              {formatInline(part)}
            </div>
          );
        }
      )}

    </div>
  );
}

/* INLINE FORMAT */

function formatInline(
  text: string
) {
  const parts =
    text.split(
      /(`[^`]+`|\*\*[^*]+\*\*)/g
    );

  return parts.map(
    (part, index) => {

      if (
        part.startsWith("`") &&
        part.endsWith("`")
      ) {
        return (
          <code
            key={index}
            style={{
              padding: "2px 5px",
              borderRadius: 5,
              background: "#222",
              border:
                "1px solid #333",
              fontFamily:
                "monospace",
              fontSize: "0.9em",
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return (
        <span key={index}>
          {part}
        </span>
      );
    }
  );
}

/* CODE BLOCK */

function CodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [copied, setCopied] =
    useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);

    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  };

  return (
    <div
      style={{
        margin: "12px 0",
        border:
          "1px solid #292929",
        borderRadius: 12,
        overflow: "hidden",
        background: "#0d0d0d",
      }}
    >

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: "#171717",
          borderBottom:
            "1px solid #292929",
        }}
      >

        <span
          style={{
            color: "#777",
            fontSize: 11,
            textTransform:
              "uppercase",
          }}
        >
          {language || "code"}
        </span>

        <button
          type="button"
          onClick={() =>
            void copy()
          }
          style={{
            padding: "5px 9px",
            background:
              "transparent",
            color: "#aaa",
            border:
              "1px solid #333",
            borderRadius: 7,
            cursor: "pointer",
            fontSize: 11,
          }}
        >
          {copied
            ? "Copied!"
            : "Copy"}
        </button>

      </div>

      <pre
        style={{
          margin: 0,
          padding: 15,
          overflowX: "auto",
          color: "#e8e8e8",
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily:
            "monospace",
        }}
      >
        <code>{code}</code>
      </pre>

    </div>
  );
}

/* TYPING */

function Typing() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        marginBottom: 25,
        color: "#777",
        fontSize: 13,
      }}
    >

      <img
        src="/logo.png"
        alt="RootX"
        style={{
          width: 27,
          height: 27,
          borderRadius: 8,
          objectFit: "cover",
        }}
      />

      RootX is thinking...

    </div>
  );
}

/* CHAT ITEM */

function ChatItem({
  chat,
  active,
  onOpen,
  onPin,
  onDelete,
}: {
  chat: Chat;
  active: boolean;
  onOpen: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`chatItem ${
        active
          ? "chatItemActive"
          : ""
      }`}
    >

      <button
        type="button"
        className="chatOpen"
        onClick={onOpen}
        title={chat.title}
      >
        {chat.title ||
          "New Chat"}
      </button>

      <button
        type="button"
        className={`chatAction ${
          chat.pinned
            ? "pinned"
            : ""
        }`}
        onClick={onPin}
        title={
          chat.pinned
            ? "Unpin"
            : "Pin"
        }
      >
        ★
      </button>

      <button
        type="button"
        className="chatAction"
        onClick={onDelete}
        title="Delete"
      >
        ×
      </button>

    </div>
  );
}
