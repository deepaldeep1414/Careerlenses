# CareerLens API

CareerLens is an AI-powered API backend designed to help users optimize their resumes against job descriptions (JDs). It provides tools to extract key skills from job postings, parse text from PDF resumes, and calculate an Applicant Tracking System (ATS) compatibility score.

## Features
- **Job Description Analysis**: Uses Groq's blazing fast LLaMA-3 models to extract exact job titles, seniority levels, must-have skills, nice-to-have skills, and top keywords from raw job description text.
- **Resume Parsing**: Accurately extracts text from PDF resumes while handling common blind spots like ligatures and multi-column layouts using `pdfplumber`.
- **ATS Scoring System**: Fairly evaluates a parsed resume against JD keywords. Uses deduplication, whole-word matching, and weighted scoring (70% must-haves, 30% nice-to-haves) to provide a realistic ATS match percentage and highlight priority gaps.
- **FastAPI Framework**: Built on modern, fast (high-performance) web framework for building APIs with Python based on standard Python type hints.

## Tech Stack
- **Python 3.11+**
- **FastAPI**: Core API framework.
- **Uvicorn**: ASGI web server.
- **Groq API**: For lightning-fast LLM inference (`llama-3.3-70b-versatile`).
- **pdfplumber**: For robust PDF resume text extraction.
- **Pydantic**: For data validation and modeling.

## Folder Structure
```text
backend/
├── main.py                 # FastAPI application entry point
├── config.py               # Environment variables configuration
├── requirements.txt        # Python dependencies
├── routers/                # API route definitions
│   ├── jd.py               # /jd endpoints
│   ├── resume.py           # /resume endpoints
│   └── score.py            # /score endpoints
├── services/               # Core business logic
│   ├── ats_scorer.py       # ATS matching algorithm
│   ├── jd_extractor.py     # Groq LLM JD extraction
│   └── pdf_parser.py       # PDF text extraction
├── models/                 # Pydantic data models
│   ├── jd_models.py
│   └── resume_models.py
└── utils/                  # Helper functions
    ├── file_handler.py     # Secure file uploads
    └── text_cleaner.py     # Text normalization
```

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deepaldeep1414/Careerlenses.git
   cd Careerlenses/backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the `backend/` directory with the following:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

5. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`. 
   You can view the interactive Swagger API documentation at `http://127.0.0.1:8000/docs`.

## API Endpoints

### 1. JD Analysis
**`POST /jd/analyze`**
Extracts structured data from raw JD text.
- **Body**: `{"text": "Full job description text..."}`
- **Response**: JSON object containing `job_title`, `must_have_skills`, `nice_to_have_skills`, etc.

### 2. Resume Scan
**`POST /resume/scan`**
Upload a PDF resume to extract text and character count.
- **Form Data**: `file` (PDF file upload)
- **Response**: Parsed text, character count, and potential layout warnings (e.g., multi-column detection).

### 3. ATS Score
**`POST /score/ats`**
Compares extracted JD keywords with parsed resume text.
- **Body**: 
  ```json
  {
    "resume_text": "Parsed resume content...",
    "must_have_skills": ["Python", "FastAPI"],
    "nice_to_have_skills": ["Docker", "AWS"],
    "top_keywords": ["Backend", "API"]
  }
  ```
- **Response**: Detailed score breakdown, match verdict, and priority gaps (skills to add).

## Security & Guardrails
- **File Upload Limits**: Prevents large file uploads (Max 5MB limit).
- **PDF Type Checks**: Verifies `.pdf` extensions and mime types.
- **LLM Rate Limiting**: Built-in exponential backoff for Groq API rate limits.
- **Text Normalization**: Strips LLM markdown blocks to prevent JSON decode errors.
