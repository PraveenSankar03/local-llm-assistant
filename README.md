# Personal AI Assistant (Local LLM)

A full-stack AI assistant built using **React + Django + Ollama**, running completely **offline with a local LLM**.

---

##  Features

- 💬 Chat with AI (local model)
- 🧠 Conversation memory
- 📂 Multiple chat sessions (ChatGPT-style)
- ✏️ Auto-generated chat titles
- 🗑️ Delete chats
- ⚡ No external APIs (fully offline)

---

##  Tech Stack

### Frontend
- React

### Backend
- Django
- Django REST Framework

### AI
- Ollama (local LLM runtime)
- Qwen:4b model

---

##  How It Works

1. User sends a message from the React UI  
2. Django backend receives the request  
3. Backend sends prompt to local LLM via Ollama  
4. LLM generates a response  
5. Response is returned and displayed in the UI  

Conversation memory is maintained using a database and passed to the model for context-aware responses.

---

##  Installation

### 1. Clone repo

````bash
git clone 
cd your-repo
````

### Install Ollama

````bash
Download and install Ollama from:
https://ollama.com
After installation, in cmd run:
ollama run qwen:4b
````    

### Backend setup

````bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
````

### Frontend setup

````bash
cd frontend
npm install
npm start
````