# AI-Powered Intelligent Interview & Skill Assessment Platform

Production-style full-stack project with:
- React frontend
- Node.js backend (JWT auth, resume upload, sessions, analytics)
- Python AI microservice (NLP skill extraction, question generation, answer evaluation, feedback)
- MongoDB

---


## Architecture

Frontend (React) -> Backend (Node/Express) -> AI Service (FastAPI) -> MongoDB



## Quick Start

1. Copy env:
   - `copy .env.example .env` (Windows)
2. Run:
   - `docker compose up --build`
3. Open:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000/health`
   - AI API: `http://localhost:8000/health`

---


## Core Features Included


## 🚀 Key Features

### ✅ 1. Authentication & JWT Security
- Secure user registration & login
- bcrypt password hashing
- JWT tokens with 7-day expiry
- Protected API routes

📁 `backend/src/controllers/authController.js`

---

### ✅ 2. Resume Parsing + NLP Skill Extraction
- PDF resume upload
- Text extraction
- AI-based skill identification endpoint
- Stores extracted skills in session

📁 `backend/src/controllers/resumeController.js`

---

### ✅ 3. Adaptive Question Generation
- Dynamic difficulty adjustment
- >75% score → Hard questions
- <40% score → Easy questions
- Performance-aware logic

📁 `backend/src/controllers/interviewController.js`

---

### ✅ 4. Semantic Answer Evaluation
- SentenceTransformers embeddings
- Cosine similarity scoring
- Keyword matching
- Context-aware evaluation

📁 `ai-service/evaluation.py`

---

### ✅ 5. Weak Topic Detection + Improvement Suggestions
- Detects topics scoring below 55%
- Filters weak concepts
- Provides structured feedback

📁 `backend/src/controllers/interviewController.js`
📁 `ai-service/feedback.py`

---

### ✅ 6. Dashboard Analytics & History
- Score trends
- Skill-wise performance
- Interview history tracking
- Role readiness analytics

📁 `backend/src/controllers/dashboardController.js`

---

### ✅ 7. Downloadable PDF Reports
- Generates structured performance reports
- Session-based PDF breakdown
- Includes skill analysis & improvement areas

📁 `backend/src/controllers/interviewController.js`
Route: `/report/:sessionId`


---

## 🧠 AI Components

| Component | Technology Used |
|------------|-----------------|
| Skill Extraction | NLP pipeline |
| Semantic Evaluation | SentenceTransformers |
| Similarity Scoring | Cosine Similarity |
| Weak Topic Detection | Threshold-based filtering |
| Adaptive Difficulty | Performance-driven logic |

---

## 🛠 Tech Stack

### 🔹 Frontend
- React
- Tailwind CSS
- Chart.js / Recharts

### 🔹 Backend
- Node.js
- Express.js
- MongoDB Atlas
- JWT Authentication
- Multer (file uploads)

### 🔹 AI Microservice
- Python
- Flask
- SentenceTransformers
- Scikit-learn
- NumPy

---

## 📦 Installation Guide

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/AI-interview-platform.git
cd AI-interview-platform

