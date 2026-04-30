# CareerLenses 🎯

> **AI-powered resume optimizer** — analyze job descriptions, score your resume against ATS systems, enhance your bullet points with LLM, and export polished resumes in DOCX or LaTeX format. Secured with JWT authentication.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Secure sign-up / sign-in with bcrypt password hashing and JWT tokens |
| 📋 **JD Analysis** | Extracts job title, seniority, must-have skills, nice-to-have skills, and top keywords using Groq LLaMA-3 |
| 📄 **Resume Parsing** | Accurately extracts text from PDF resumes via `pdfplumber` (handles ligatures and multi-column layouts) |
| 📊 **ATS Scoring** | Weighted scoring engine (70% must-haves, 30% nice-to-haves) with gap analysis |
| ✏️ **AI Enhancement** | Rewrites resume bullet points to naturally inject missing keywords using LLaMA-3.3-70B |
| 📤 **Export** | Download your enhanced resume as a **DOCX** or **LaTeX** file |

---

## 🖥️ Tech Stack

### Backend
- **Python 3.11+** with **FastAPI** — high-performance async API framework
- **SQLite** + **SQLAlchemy** — lightweight relational database with ORM
- **bcrypt** — secure password hashing (raw, not passlib)
- **python-jose** — JWT creation and verification
- **Groq API** — LLaMA-3 inference for JD analysis and resume enhancement
- **pdfplumber** — robust PDF text extraction
- **Uvicorn** — ASGI server

### Frontend
- **React 19** + **Vite 8** — modern SPA with fast HMR
- **React Router v7** — client-side routing with protected routes
- **Axios** — HTTP client with global auth interceptor
- **Vanilla CSS** — glassmorphism design, no CSS framework dependency

---

## 📁 Project Structure

```text
Careerlenses/
├── backend/
│   ├── main.py                   # FastAPI app, CORS, router registration
│   ├── config.py                 # Environment variable loading
│   ├── database.py               # SQLAlchemy engine + session
│   ├── requirements.txt          # Python dependencies
│   ├── fix_db.py                 # One-time DB migration helper
│   ├── migrate_db.py             # Schema migration script
│   ├── models/
│   │   ├── user.py               # User ORM model + Pydantic schemas
│   │   ├── jd_models.py          # JD request/response schemas
│   │   └── resume_models.py      # Resume schemas
│   ├── routers/
│   │   ├── auth.py               # POST /auth/register, /auth/login, GET /auth/me
│   │   ├── jd.py                 # POST /jd/analyze
│   │   ├── resume.py             # POST /resume/scan
│   │   ├── score.py              # POST /score/ats
│   │   ├── enhance.py            # POST /enhance/
│   │   └── export.py             # POST /export/generate-docx|latex, GET /export/download/...
│   ├── services/
│   │   ├── jd_extractor.py       # Groq LLM JD extraction logic
│   │   ├── pdf_parser.py         # PDF text extraction
│   │   ├── ats_scorer.py         # ATS scoring algorithm
│   │   └── resume_enhancer.py    # LLM bullet point enhancement
│   └── utils/
│       ├── security.py           # bcrypt hashing + JWT helpers + auth dependencies
│       ├── auth_utils.py         # Legacy auth helpers
│       ├── file_handler.py       # Secure file upload handling
│       └── text_cleaner.py       # Text normalization
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx               # Router + AuthProvider setup
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx   # Auth state, login/signup/logout, error classification
        ├── components/
        │   └── PrivateRoute.jsx  # JWT-gated route wrapper
        ├── pages/
        │   ├── Login.jsx         # Sign-in / sign-up with glassmorphism UI
        │   ├── Home.jsx          # Landing page
        │   ├── Analyze.jsx       # JD + Resume analysis flow
        │   └── Result.jsx        # ATS score + enhancement results
        └── services/
            └── api.js            # Axios API helper functions
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)

---

### Backend

```bash
# 1. Clone the repo
git clone https://github.com/deepaldeep1414/Careerlenses.git
cd Careerlenses/backend

# 2. Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_super_secret_jwt_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

```bash
# 5. Start the server
uvicorn main:app --reload
```

> API runs at `http://127.0.0.1:8000`  
> Interactive docs at `http://127.0.0.1:8000/docs`

---

### Frontend

```bash
cd Careerlenses/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

> App runs at `http://localhost:5173` (or `5174` if 5173 is occupied)

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Create a new account | ❌ |
| `POST` | `/auth/login` | Sign in, receive JWT | ❌ |
| `GET` | `/auth/me` | Get current user profile | ✅ Bearer token |

**Register** — `POST /auth/register`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "securepass123" }
```

**Login** — `POST /auth/login` (form-encoded)
```
username=jane@example.com&password=securepass123
```
Returns:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
}
```

---

### Core Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/jd/analyze` | Extract structured data from a job description |
| `POST` | `/resume/scan` | Parse text from a PDF resume |
| `POST` | `/score/ats` | Calculate ATS compatibility score |
| `POST` | `/enhance/` | AI-rewrite resume bullets to add missing keywords |
| `POST` | `/export/generate-docx` | Generate a DOCX resume file |
| `POST` | `/export/generate-latex` | Generate a LaTeX resume file |
| `GET` | `/export/download/docx/{id}` | Download generated DOCX |
| `GET` | `/export/download/latex/{id}` | Download generated LaTeX |

---

## 🔒 Security

- **Password hashing** — bcrypt with salt rounds (raw `bcrypt` library, passlib not used due to bcrypt 5.x incompatibility)
- **JWT tokens** — signed with `HS256`, expire after 24 hours by default
- **Protected routes** — `PrivateRoute` component redirects unauthenticated users to `/login`
- **CORS** — restricted to `localhost:5173`, `localhost:5174`, and the production Vercel domain
- **File upload limits** — max 5MB, PDF mime type verification
- **LLM rate limiting** — exponential backoff on Groq API rate limit errors

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
