# AI-Powered Intelligent Interview & Skill Assessment Platform

Production-style full-stack project with:
- React frontend
- Node.js backend (JWT auth, resume upload, sessions, analytics)
- Python AI microservice (NLP skill extraction, question generation, answer evaluation, feedback)
- MongoDB
- Docker Compose deployment

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

## Core Features Included

1. Authentication and user management (JWT, bcrypt, protected routes, role checks)
2. Resume upload and parsing (PDF upload + extraction + text cleaning)
3. Skill extraction engine (TF-IDF/keyword frequency + dictionary matching + confidence score)
4. 30-question interview generation (10 easy + 10 medium + 10 hard)
5. Adaptive difficulty engine (score-aware next question selection)
6. AI answer evaluation (embedding-based semantic + keyword + normalization scoring)
7. Weak topic detection and targeted improvement suggestions
8. Skill gap detection against uploaded job description
9. Downloadable PDF performance report
10. Dashboard analytics (overall, skills, weak topics, trend, history)
11. Admin endpoints (users, weak skills/topics, recruiter notes)
12. Explainable AI panel (semantic, keyword coverage, matched/missing concepts)
13. Role readiness scoring (resume + interview + coding weighted score)
14. Coding round engine (problems, submissions, scoring)
15. Microservice separation with HTTP integration
16. Dockerized deployment support
