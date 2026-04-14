# Privacy-First Local LLM Orchestration Engine

A full-stack AI chat assistant that runs **entirely on your machine** — no cloud, no API costs, no data leaving your device. Built with React, Django REST Framework, and Ollama (Qwen 4B).

> **Why local?** Most AI assistants send your conversations to external servers. This project was built on the deliberate architectural decision to keep inference local — eliminating API costs entirely and ensuring 100% data privacy.

---

## Demo

![Main chat interface](<./assests/chat_interface.png>)

---

## Features

- **Fully offline** — zero cloud dependency, zero API cost
- **Persistent chat sessions** — ChatGPT-style sidebar with multiple conversations
- **Conversation memory** — full message history passed to the model for context-aware responses
- **Auto-generated titles** — chat sessions are named automatically based on content
- **Real-time chat UI** — no page reloads, instant responses
- **Delete sessions** — clean session management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Django, Django REST Framework |
| AI Runtime | Ollama |
| LLM Model | Qwen 4B |
| Database | SQLite |

---

## Architecture

```
React UI  →  Django REST API  →  Ollama (local)  →  Qwen 4B (on-device)
                  ↕
              SQLite DB
          (session & message store)
```

1. User sends a message from the React frontend
2. Django backend receives the request and retrieves conversation history from SQLite
3. Full conversation context is passed to the local LLM via Ollama
4. Qwen 4B generates a response entirely on-device
5. Response is saved to the database and returned to the UI

No data ever leaves your machine.

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.com) installed on your machine

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/PraveenSankar03/local-llm-assistant.git
cd local-llm-assistant
```

### 2. Set up Ollama and pull the model

```bash
# Install Ollama from https://ollama.com, then run:
ollama pull qwen:4b

# Verify it works
ollama run qwen:4b
```

### 3. Set up the backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 4. Set up the frontend

```bash
cd frontend
npm install
npm start
```

### 5. Open the app

Navigate to `http://localhost:3000` in your browser.

---

## Project Structure

```
local-llm-assistant/
├── backend/
│   ├── chat/               # Django app — models, views, serializers
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.js
│   └── package.json
└── README.md
```

---

## Design Decisions

**Why Ollama over cloud APIs?**
Cloud LLM APIs (OpenAI, Gemini, etc.) charge per token and send your data to external servers. Ollama runs open-source models locally, making this assistant completely free to run after setup and fully air-gapped for privacy-sensitive use cases.

**Why Qwen 4B?**
Qwen 4B offers a strong balance between response quality and hardware requirements — capable of running on a mid-range machine without a dedicated GPU, while still producing coherent, context-aware responses.

---

## Author

**Praveen Sankar**
[GitHub](https://github.com/PraveenSankar03) · [LinkedIn](https://www.linkedin.com/in/praveen-kumar-40109b366/)