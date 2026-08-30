"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
  const [userName, setUserName] = useState("RootX User");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [topMenuOpen, setTopMenuOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  /* LOAD LOGGED-IN USER */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(
          user.displayName ||
          user.email?.split("@")[0] ||
          "RootX User"
        );
      } else {
        setUserName("RootX User");
      }
    });

    return () => unsubscribe();
  }, []);

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

  /* ATTACHMENTS */
  const chooseAttachment = (accept: string) => {
    setShowAttachmentMenu(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      setAttachment(file);
      setAttachmentPreview(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      );
    };
    input.click();
  };

  const removeAttachment = () => {
    if (attachmentPreview) URL.revokeObjectURL(attachmentPreview);
    setAttachment(null);
    setAttachmentPreview(null);
  };

  /* SEND MESSAGE */

  const sendMessage = async () => {
    const text = message.trim();

    if ((!text && !attachment) || loading) return;

    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {}

      setListening(false);
    }

    const chatId = getChatId(text || attachment?.name || "Attachment");

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: text || `📎 ${attachment?.name || "Attachment"}`,
    };

    const sentAttachment = attachment;
    setMessage("");
    removeAttachment();

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
          message: text || `User attached: ${sentAttachment?.name || "a file"}`,
          attachment: sentAttachment
            ? {
                name: sentAttachment.name,
                type: sentAttachment.type,
                size: sentAttachment.size,
              }
            : null,
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

  /* RENAME CHAT */

  const renameChat = (id: string) => {
    const chat = chats.find((item) => item.id === id);
    if (!chat) return;

    const nextTitle = window.prompt("Rename chat", chat.title);
    const title = nextTitle?.trim();

    if (!title) return;

    setChats((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, title: title.slice(0, 70) }
          : item
      )
    );
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
            {userName}
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

        <header className="chatHeader">
          <div className="chatHeaderTitle">
            <div className="chatHeaderText">
              <strong>
                {activeChat?.title || "New Chat"}
              </strong>
              <span>
                {activeChat?.pinned ? "Pinned · " : ""}RootX AI Workspace
              </span>
            </div>
          </div>

          <div className="headerActions">
            <button
              type="button"
              className="founderButton"
              onClick={() => router.push("/founder")}
              title="Meet the Founder"
            >
              <span className="founderIcon">◈</span>
              <span className="founderButtonText">Founder</span>
            </button>

            {activeChat?.pinned && (
              <span className="headerPin" title="Pinned chat">📌</span>
            )}
            <button
              type="button"
              className="headerDots"
              onClick={() => setTopMenuOpen((v) => !v)}
              aria-label="Chat options"
              title="Chat options"
            >
              ⋯
            </button>

            {topMenuOpen && (
              <>
                <button
                  type="button"
                  className="topMenuBackdrop"
                  aria-label="Close chat menu"
                  onClick={() => setTopMenuOpen(false)}
                />
                <div className="topChatMenu">
                  <div className="topMenuLabel">CHAT OPTIONS</div>

                  <button
                    type="button"
                    disabled={!activeChat}
                    onClick={() => {
                      if (activeChat) togglePin(activeChat.id);
                      setTopMenuOpen(false);
                    }}
                  >
                    <span>📌</span>
                    {activeChat?.pinned ? "Unpin chat" : "Pin chat"}
                  </button>

                  <button
                    type="button"
                    disabled={!activeChat}
                    onClick={() => {
                      if (activeChat) renameChat(activeChat.id);
                      setTopMenuOpen(false);
                    }}
                  >
                    <span>✎</span>
                    Rename chat
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      newChat();
                      setTopMenuOpen(false);
                    }}
                  >
                    <span>＋</span>
                    New chat
                  </button>

                  <div className="topMenuDivider" />

                  <button
                    type="button"
                    className="dangerMenuItem"
                    disabled={!activeChat}
                    onClick={() => {
                      if (activeChat) deleteChat(activeChat.id);
                      setTopMenuOpen(false);
                    }}
                  >
                    <span>⌫</span>
                    Delete chat
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="messages">

          {messages.length === 0 ? (

            <Welcome />

          ) : (

            <>
              {messages.map((msg) => (

                <MessageBubble
                  key={msg.id}
                  message={msg}
                  speaking={speaking}
                  onSpeak={() => speakResponse(msg.text)}
                  onStop={stopSpeaking}
                />

              ))}

              {loading && <Typing />}

              <div ref={bottomRef} />

            </>

          )}

        </div>

        {/* INPUT */}

        <div className="inputArea">

          {attachment && (
            <div className="attachmentPreview">
              <div className="attachmentInfo">
                {attachmentPreview ? (
                  <img src={attachmentPreview} alt={attachment.name} />
                ) : (
                  <div className="fileIcon">📎</div>
                )}
                <div>
                  <strong>{attachment.name}</strong>
                  <span>{Math.max(1, Math.round(attachment.size / 1024))} KB</span>
                </div>
              </div>
              <button type="button" onClick={removeAttachment} title="Remove attachment">×</button>
            </div>
          )}

          <div className="inputBox">
            <div className="attachWrap">
              <button
                type="button"
                className="plusButton"
                onClick={() => setShowAttachmentMenu((v) => !v)}
                disabled={loading}
                title="Attach"
              >
                +
              </button>

              {showAttachmentMenu && (
                <div className="attachmentMenu">
                  <button type="button" onClick={() => chooseAttachment("image/*")}>
                    <span>▣</span> Photos
                  </button>
                  <button type="button" onClick={() => chooseAttachment("image/*;capture=camera")}>
                    <span>◉</span> Camera
                  </button>
                  <button type="button" onClick={() => chooseAttachment("*/*")}>
                    <span>📎</span> Files
                  </button>
                </div>
              )}
            </div>

            <textarea
              ref={inputRef}
              value={message}
              disabled={loading}
              rows={1}
              placeholder={listening ? "Listening..." : "Message RootX..."}
              onChange={(e) => {
                setMessage(e.target.value);
                e.currentTarget.style.height = "auto";
                e.currentTarget.style.height =
                  `${Math.min(e.currentTarget.scrollHeight, 160)}px`;
              }}
              onKeyDown={handleKeyDown}
            />

            <button
              type="button"
              className={`voiceButton ${listening ? "voiceActive" : ""}`}
              onClick={startVoiceInput}
              disabled={loading}
              title={listening ? "Stop listening" : "Speak to RootX"}
            >
              {listening ? "⏹" : "🎙"}
            </button>

            <button
              type="button"
              disabled={loading || (!message.trim() && !attachment)}
              onClick={() => void sendMessage()}
              title="Send message"
            >
              {loading ? "..." : "Send"}
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

        .history {
          min-width: 0;
          width: 100%;
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
          gap: 3px;
          margin: 0 0 3px 0;
          padding: 0 2px 0 0;
          border-radius: 9px;
          min-width: 0;
          width: 100%;
          height: 38px;
          overflow: visible;
        }

        .chatItemActive {
          background: #1d1d1d;
        }

        .chatOpen {
          display: block;
          flex: 1 1 0;
          min-width: 0;
          width: 0;
          max-width: 100%;
          height: 36px;
          padding: 0 5px 0 10px;
          border: 0;
          background: transparent;
          color: #aaa;
          text-align: left;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          word-break: normal !important;
          overflow-wrap: normal !important;
          cursor: pointer;
          font-size: 12px;
          line-height: 36px;
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

        .chatHeader {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          padding: 10px 24px 10px 86px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(to bottom, rgba(9,9,9,.98), rgba(9,9,9,.82), rgba(9,9,9,0));
          z-index: 60;
          pointer-events: none;
        }

        .chatHeaderTitle,
        .headerActions {
          pointer-events: auto;
        }

        .chatHeaderTitle {
          display: flex;
          align-items: center;
          gap: 20px;
          min-width: 0;
        }

        .chatHeaderLogo {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          overflow: hidden;
          background: #151515;
          border: 1px solid #292929;
          flex-shrink: 0;
        }

        .chatHeaderLogo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .chatHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .chatHeaderText strong {
          max-width: min(520px, 55vw);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 600;
          color: #eee;
        }

        .chatHeaderText span {
          font-size: 9px;
          letter-spacing: .7px;
          text-transform: uppercase;
          color: #555;
        }

        .headerActions {
          position: relative;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .founderButton {
          height: 38px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #303030;
          border-radius: 11px;
          background: linear-gradient(
            135deg,
            rgba(25,25,25,.96),
            rgba(14,14,14,.96)
          );
          color: #aaa;
          cursor: pointer;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .7px;
          text-transform: uppercase;
          transition: .2s ease;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.035);
        }

        .founderIcon {
          width: 19px;
          height: 19px;
          display: grid;
          place-items: center;
          border: 1px solid #3b3b3b;
          border-radius: 6px;
          color: #b8ff39;
          font-size: 10px;
          transition: .2s ease;
        }

        .founderButton:hover {
          color: #fff;
          border-color: #505050;
          background: linear-gradient(
            135deg,
            rgba(35,35,35,.98),
            rgba(18,18,18,.98)
          );
          transform: translateY(-1px);
          box-shadow:
            0 8px 24px rgba(0,0,0,.28),
            0 0 18px rgba(160,255,45,.06);
        }

        .founderButton:hover .founderIcon {
          color: #d5ff75;
          border-color: #606060;
          transform: rotate(45deg);
        }

        .headerPin {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border: 1px solid #2c2c2c;
          border-radius: 10px;
          background: rgba(20,20,20,.9);
          font-size: 12px;
        }

        .headerDots {
          width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid #2b2b2b;
          border-radius: 11px;
          background: rgba(18,18,18,.92);
          color: #aaa;
          cursor: pointer;
          font-size: 21px;
          line-height: 1;
          letter-spacing: 1px;
        }

        .headerDots:hover {
          color: #fff;
          border-color: #444;
          background: #1d1d1d;
        }

        .topChatMenu {
          position: absolute;
          top: 47px;
          right: 0;
          width: 190px;
          padding: 7px;
          border: 1px solid #303030;
          border-radius: 14px;
          background: rgba(20,20,20,.98);
          box-shadow: 0 22px 55px rgba(0,0,0,.55);
          z-index: 100;
        }

        .topMenuLabel {
          padding: 7px 9px 6px;
          color: #555;
          font-size: 9px;
          letter-spacing: 1.2px;
          font-weight: 700;
        }

        .topChatMenu button {
          width: 100%;
          height: 38px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #ddd;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 9px;
          text-align: left;
          font-size: 11px;
          cursor: pointer;
        }

        .topChatMenu button:hover:not(:disabled) {
          background: #292929;
          color: #fff;
        }

        .topChatMenu button:disabled {
          opacity: .35;
          cursor: not-allowed;
        }

        .topChatMenu button span {
          width: 19px;
          text-align: center;
        }

        .topMenuDivider {
          height: 1px;
          background: #2b2b2b;
          margin: 5px 2px;
        }

        .dangerMenuItem:hover:not(:disabled) {
          background: #2a1919 !important;
          color: #ff8d8d !important;
        }

        .topMenuBackdrop {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          border: 0 !important;
          padding: 0 !important;
          background: transparent !important;
          z-index: 99 !important;
        }

        .messages {
          width: 900px;
          max-width: 94%;
          flex: 1;
          overflow-y: auto;
          padding-top: 85px;
          padding-bottom: 20px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .messages::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
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

        .pinMark {
          color: #aaa;
          font-size: 10px;
          flex-shrink: 0;
          opacity: .9;
          margin-right: 1px;
        }

        .menuDots {
          width: 30px !important;
          height: 30px !important;
          padding: 0 !important;
          font-size: 18px !important;
          line-height: 1;
          letter-spacing: 1px;
        }

        .chatMenu {
          position: absolute;
          right: 6px;
          top: 39px;
          width: 155px;
          padding: 6px;
          background: #191919;
          border: 1px solid #343434;
          border-radius: 12px;
          box-shadow: 0 16px 45px rgba(0,0,0,.5);
          z-index: 150;
        }

        .chatMenu button {
          width: 100%;
          height: 36px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #ddd;
          text-align: left;
          padding: 0 9px;
          cursor: pointer;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .chatMenu button:hover {
          background: #292929;
        }

        .chatMenu .deleteOption:hover {
          background: #2a1919;
          color: #ff8d8d;
        }

        .chatMenu button span {
          width: 18px;
          text-align: center;
        }

        .menuBackdrop {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          padding: 0 !important;
          border: 0 !important;
          background: transparent !important;
          z-index: 149 !important;
          cursor: default !important;
        }

        .attachmentPreview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
          padding: 9px 11px;
          background: #151515;
          border: 1px solid #303030;
          border-radius: 14px;
        }

        .attachmentInfo {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .attachmentInfo img,
        .fileIcon {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          object-fit: cover;
          background: #222;
          display: grid;
          place-items: center;
          flex-shrink: 0;
        }

        .attachmentInfo strong {
          display: block;
          max-width: 620px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 12px;
        }

        .attachmentInfo span {
          display: block;
          color: #666;
          font-size: 10px;
          margin-top: 3px;
        }

        .attachmentPreview > button {
          width: 30px;
          height: 30px;
          border: 0;
          border-radius: 8px;
          background: #222;
          color: #aaa;
          cursor: pointer;
          font-size: 18px;
        }

        .attachWrap {
          position: relative;
          flex-shrink: 0;
        }

        .plusButton {
          width: 48px !important;
          height: 48px !important;
          padding: 0 !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          background: #1b1b1b !important;
          color: #fff !important;
          font-size: 25px !important;
          font-weight: 400 !important;
        }

        .attachmentMenu {
          position: absolute;
          left: 0;
          bottom: 57px;
          width: 185px;
          padding: 7px;
          background: rgba(20,20,20,.98);
          border: 1px solid #333;
          border-radius: 14px;
          box-shadow: 0 18px 50px rgba(0,0,0,.45);
          z-index: 20;
        }

        .attachmentMenu button {
          width: 100% !important;
          height: 40px !important;
          padding: 0 10px !important;
          border: 0 !important;
          border-radius: 9px !important;
          background: transparent !important;
          color: #ddd !important;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          font-size: 12px;
          font-weight: 500 !important;
        }

        .attachmentMenu button:hover {
          background: #292929 !important;
        }

        .messageTools {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }

        .speakButton {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid #2f2f2f;
          border-radius: 9px;
          background: #141414;
          color: #aaa;
          cursor: pointer;
          font-size: 11px;
          transition: .18s ease;
        }

        .speakButton:hover {
          background: #222;
          color: #fff;
          border-color: #444;
          transform: translateY(-1px);
        }

        .speakButtonActive {
          color: #8cff00;
          border-color: rgba(140,255,0,.35);
        }

        @media (max-width: 600px) {
          .logoButton {
            top: 40px;
          }

          .chatHeader {
            top: 28px;
            padding-left: 76px;
            padding-right: 14px;
          }

          .chatHeaderText strong {
            max-width: 42vw;
          }

          .chatHeaderLogo {
            width: 30px;
            height: 30px;
          }

          .founderButton {
            height: 34px;
            padding: 0 9px;
            gap: 5px;
            font-size: 9px;
          }

          .founderIcon {
            width: 17px;
            height: 17px;
          }

          .headerDots,
          .headerPin {
            width: 34px;
            height: 34px;
          }

          .sidebar {
            width: 285px;
          }

          .messages {
            max-width: 92%;
            padding-top: 106px;
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
  speaking,
  onSpeak,
  onStop,
}: {
  message: Message;
  speaking: boolean;
  onSpeak: () => void;
  onStop: () => void;
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

          {!user && (
            <div className="messageTools">
              <button
                type="button"
                className={`speakButton ${speaking ? "speakButtonActive" : ""}`}
                onClick={speaking ? onStop : onSpeak}
                title={speaking ? "Stop reading" : "Read this response aloud"}
              >
                {speaking ? "■ Stop" : "◉ Listen"}
              </button>
            </div>
          )}
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={`chatItem ${active ? "chatItemActive" : ""}`}
      style={{ position: "relative" }}
    >
      <button
        type="button"
        className="chatOpen"
        onClick={onOpen}
        title={chat.title}
      >
        {chat.title || "New Chat"}
      </button>

      {chat.pinned && <span className="pinMark" title="Pinned chat">📌</span>}

      <button
        type="button"
        className="chatAction menuDots"
        onClick={() => setMenuOpen((v) => !v)}
        title="Chat options"
        aria-label="Chat options"
      >
        ⋯
      </button>

      {menuOpen && (
        <>
          <button
            type="button"
            className="menuBackdrop"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div className="chatMenu">
            <button
              type="button"
              onClick={() => {
                onPin();
                setMenuOpen(false);
              }}
            >
              <span>📌</span>
              {chat.pinned ? "Unpin chat" : "Pin chat"}
            </button>
            <button
              type="button"
              className="deleteOption"
              onClick={() => {
                onDelete();
                setMenuOpen(false);
              }}
            >
              <span>⌫</span>
              Delete chat
            </button>
          </div>
        </>
      )}
    </div>
  );
}
