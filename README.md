# 🤖 AI ChatBot

An interactive AI-powered chatbot built using **HTML**, **CSS**, **JavaScript**, and **Python Flask**. It combines local knowledge base with Together.ai's LLM API for comprehensive responses.

---

## 📌 About This Project

AI ChatBot is an advanced web-based chatbot application that uses a hybrid approach to answer user queries:

1. **Local Knowledge Base**: First checks responses from `chatbot.txt` using NLP techniques
2. **Together.ai Fallback**: When no relevant answer is found locally, queries Together.ai's powerful language models

Built with Python (Flask) backend and modern web technologies, this chatbot provides:

- Fast responses from local knowledge base
- Comprehensive answers from AI when needed
- Seamless integration between local and cloud-based AI

The core logic combines:
- TF-IDF and Cosine Similarity for local answer matching
- Together.ai API for advanced natural language understanding

---

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Flexbox, Grid)
- JavaScript (ES6, Fetch API)

### Backend
- Python 3
- Flask
- Flask-CORS
- NLTK
- scikit-learn
- Together.ai API

### AI Components
- Local NLP processing (TF-IDF, Cosine Similarity)
- Cloud-based LLM (Together.ai)

---

## ✨ Features

- 🧠 Hybrid AI system (local + cloud)
- 📄 Local knowledge base (`chatbot.txt`)
- ☁️ Together.ai API integration
- 🔍 Automatic fallback to cloud when local answers aren't found
- 💬 Real-time chat interface with voice functionality 
- ⌨️ Send messages with Enter key or button
- 🎨 Modern, responsive UI with animations
- 📱 Mobile-friendly design

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.8+
- Together.ai API key (free tier available)

### 1. Clone the Repository
```bash
git clone https://github.com/monu754/ChatBot.git
cd ChatBot