import { useState, useEffect, useRef } from "react";
import "./App.css";

export default function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/conversations/")
      .then((res) => res.json())
      .then(setChats)
      .catch(console.error);
  }, []);

  const loadChat = async (id) => {
    setCurrentChat(id);

    const res = await fetch(`http://localhost:8000/api/chat/${id}/`);
    const data = await res.json();

    const formatted = data.map((msg) => ({
      text: msg.content,
      sender: msg.role === "user" ? "user" : "bot",
    }));

    setMessages(formatted);
  };

  const createNewChat = async () => {
    const res = await fetch("http://localhost:8000/api/create_chat/", {
      method: "POST",
    });

    const data = await res.json();

    setCurrentChat(data.id);
    setMessages([]);

    const updated = await fetch("http://localhost:8000/api/conversations/");
    setChats(await updated.json());
  };

  const sendPrompt = async () => {
    if (!input.trim()) return;

    let chatId = currentChat;

    if (!chatId) {
      const res = await fetch("http://localhost:8000/api/create_chat/", {
        method: "POST",
      });

      const data = await res.json();
      chatId = data.id;
      setCurrentChat(chatId);

      const updated = await fetch("http://localhost:8000/api/conversations/");
      setChats(await updated.json());
    }

    const currentInput = input;

    setMessages((prev) => [...prev, { text: currentInput, sender: "user" }]);

    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentInput,
          conversation_id: chatId,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { text: data?.response || "No response", sender: "bot" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { text: "Error connecting to AI", sender: "bot" },
      ]);
    }

    const updated = await fetch("http://localhost:8000/api/conversations/");
    setChats(await updated.json());

    setLoading(false);
  };

  const deleteChat = async (id, e) => {
    e.stopPropagation();

    await fetch(`http://localhost:8000/api/chat/${id}/delete/`, {
      method: "DELETE",
    });

    setChats((prev) => prev.filter((c) => c.id !== id));

    if (currentChat === id) {
      setCurrentChat(null);
      setMessages([]);
    }
  };

  const renameChat = async (chat) => {
    const newTitle = prompt("Enter new name:");

    if (!newTitle) return;

    await fetch(`http://localhost:8000/api/chat/${chat.id}/rename/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });

    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, title: newTitle } : c)),
    );
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">Proximity</div>

        <button className="new-chat" onClick={createNewChat}>
          + New Chat
        </button>

        <div className="chat-list">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${currentChat === chat.id ? "active" : ""}`}
              onClick={() => loadChat(chat.id)}
              onDoubleClick={() => renameChat(chat)}
            >
              <span className="chat-title">
                {chat.title || `Chat ${chat.id}`}
              </span>

              <button
                className="delete-btn"
                onClick={(e) => deleteChat(chat.id, e)}
              >
                delete
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        {currentChat && (
          <div className="topbar">
            <div>
              <div className="topbar-title">
                {chats.find((c) => c.id === currentChat)?.title ||
                  `Chat ${currentChat}`}
              </div>
              <div className="topbar-sub">Qwen 4B</div>
            </div>
            <div className="topbar-badge">Qwen 4B</div>
          </div>
        )}
        <div className="chat">
          {!currentChat && (
            <div className="empty">How can I help you today?</div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`row ${msg.sender}`}>
              {msg.sender === "bot" && (
                <div className="bot-avatar">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              )}
              <div className="bubble-wrap">
                <div className="bubble">{msg.text}</div>
                <div className="msg-time">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="row bot">
              <div className="typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <div className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
          />
          <button onClick={sendPrompt} aria-label="Send">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon
                points="22 2 15 22 11 13 2 9 22 2"
                fill="white"
                stroke="none"
              />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
