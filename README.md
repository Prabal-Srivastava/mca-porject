🚀 CodeForge — AI Cloud Developer Platform (Flask Edition)
A production-grade Remote Code Execution (RCE) Platform with AI-Powered Self-Healing Microservices
Think of it as Replit + LeetCode + AWS + AI DevOps — now powered by Flask instead of FastAPI.

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Backend (Flask) Modules](#backend-flask-modules)
- [Frontend Modules](#frontend-modules)
- [Setup Guide](#setup-guide)
- [API Reference](#api-reference)
- [WebSocket System](#websocket-system)
- [Security Model](#security-model)
- [AI Self-Healing](#ai-self-healing)
- [Deployment](#deployment)

## 🏗 Architecture Overview (Flask)
Frontend (React)
↓
REST API + Socket.IO
↓
Backend (Flask)
↓
Redis (Queue + Pub/Sub)
↓
Workers (Executor + Judge)
↓
Docker Sandbox
↓
MongoDB
↓
AI Healer

## 🛠 Tech Stack (Updated)
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | Flask |
| WebSocket | Flask-SocketIO |
| Queue | Redis |
| DB | MongoDB |
| Sandbox | Docker |
| AI | OpenAI / Gemini |
| Auth | JWT |
| Validation | Marshmallow |

## 📁 Project Structure
```text
codeforge/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── routes.py
│   │   │   └── websocket.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── redis_client.py
│   │   │   └── security.py
│   │   ├── models/
│   │   ├── services/
│   │   ├── workers/
│   │   └── ai/
├── frontend/
│   └── src/
└── infrastructure/
```

## ⚙️ Backend Modules (Flask)

### 1. main.py
```python
from flask import Flask
from flask_cors import CORS
from app.api.routes import api_bp
from app.api.websocket import socketio

app = Flask(__name__)
CORS(app)

app.register_blueprint(api_bp, url_prefix="/api/v1")

socketio.init_app(app, cors_allowed_origins="*")

@app.route("/")
def home():
    return {"message": "CodeForge Flask API running"}

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=8000)
```

### 2. API Routes (routes.py)
```python
from flask import Blueprint, request, jsonify
from app.services.execution_service import submit_job

api_bp = Blueprint("api", __name__)

@api_bp.route("/submit", methods=["POST"])
def submit():
    data = request.json
    job_id = submit_job(data)
    return jsonify({"job_id": job_id, "status": "queued"})
```

### 3. WebSocket (websocket.py)
```python
from flask_socketio import SocketIO, emit
import redis

socketio = SocketIO()
r = redis.Redis(host="redis", port=6379)

@socketio.on("join_job")
def join_job(data):
    job_id = data["job_id"]
    pubsub = r.pubsub()
    pubsub.subscribe(f"job:{job_id}")

    for message in pubsub.listen():
        if message["type"] == "message":
            emit("job_update", message["data"].decode())
```

### 4. Execution Service
```python
import redis
import uuid

r = redis.Redis(host="redis", port=6379)

def submit_job(data):
    job_id = str(uuid.uuid4())
    r.lpush("job_queue", str({"id": job_id, "data": data}))
    return job_id
```

### 5. Worker (code_executor.py)
```python
import redis
import docker

r = redis.Redis(host="redis", port=6379)
client = docker.from_env()

while True:
    _, job = r.brpop("job_queue")
    print("Executing:", job)

    # Run Docker container here
```

### 6. AI Healer
```python
def diagnose(metrics):
    if metrics["cpu"] > 80:
        return "scale"
    if metrics["memory"] > 85:
        return "restart"
    return "healthy"
```

## 🎨 Frontend Modules

### Code Execution Hook
```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

export const runCode = (job_id) => {
  socket.emit("join_job", { job_id });

  socket.on("job_update", (data) => {
    console.log(data);
  });
};
```

## 🚦 Setup Guide

### Install Backend
```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

### Install Frontend
```bash
cd frontend
npm install
npm run dev
```

## � API Reference
### Submit Code
`POST /api/v1/submit`

### Get Status
`GET /api/v1/status/{job_id}`

## 🔌 WebSocket API
- **Client →** `join_job`
- **Server →** `job_update`

## � Security Model
- Docker sandbox isolation
- Memory limit (128MB)
- CPU limit
- Network disabled
- JWT authentication
- Rate limiting

## 🧠 AI Self-Healing
**Flow:**
Monitor → Detect Issue → Diagnose → Fix

**Actions:**
- Restart container
- Scale service
- Rebuild deployment
- Escalate issue

## 🌐 Deployment
### Docker
`docker-compose up -d --build`

### Kubernetes
`kubectl apply -f k8s/`

## 📦 requirements.txt
```text
flask
flask-cors
flask-socketio
eventlet
redis
pymongo
marshmallow
docker
```
