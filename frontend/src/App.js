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
        <div className="logo">Null Void - Qwen 4B</div>

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
        <div className="chat">
          {!currentChat && (
            <div className="empty">How can I help you today ?</div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`row ${msg.sender}`}>
              <div className="bubble">{msg.text}</div>
            </div>
          ))}

          {loading && (
            <div className="row bot">
              <div className="bubble typing">Typing...</div>
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
          <button onClick={sendPrompt}>➤</button>
        </div>
      </main>
    </div>
  );
}
