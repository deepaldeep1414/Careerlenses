import pdfplumber
import os
import groq
import json
import time
from utils.text_cleaner import clean_text
from config import GROQ_API_KEY

client = groq.Groq(api_key=GROQ_API_KEY)

def parse_resume(file_path: str) -> dict:
    text = ""
    page_count = 0

    try:
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        raise ValueError(f"Could not read PDF: {str(e)}")
    finally:
        try:
            os.remove(file_path)
        except:
            pass

    if len(text.strip()) < 100:
        raise ValueError(
            "Your PDF appears to be image-based. "
            "Please upload a text-based PDF resume."
        )

    cleaned = clean_text(text)
    structured = parse_into_sections(cleaned)
    structured["raw_text"] = cleaned
    structured["word_count"] = len(cleaned.split())
    structured["page_count"] = page_count
    structured["is_valid"] = True
    structured["message"] = "Resume parsed successfully"
    return structured


def parse_into_sections(raw_text: str) -> dict:
    prompt = f"""
    Parse this resume into structured JSON.
    Return ONLY valid JSON, no markdown, no explanation.

    {{
        "name": "full name",
        "email": "email address",
        "phone": "phone number",
        "linkedin": "linkedin URL or empty string",
        "summary": "professional summary paragraph or empty string",
        "skills": ["skill1", "skill2"],
        "experience": [
            {{
                "company": "company name",
                "title": "job title",
                "dates": "start - end dates",
                "bullets": ["bullet point 1", "bullet point 2"]
            }}
        ],
        "education": [
            {{
                "school": "university name",
                "degree": "degree name",
                "year": "graduation year"
            }}
        ],
        "projects": [
            {{
                "name": "project name",
                "description": "what it does",
                "bullets": ["bullet1", "bullet2"]
            }}
        ]
    }}

    Rules:
    - Extract EXACTLY what is in the resume
    - Do NOT add or invent anything
    - Keep bullet points word for word
    - If a section does not exist return empty array

    Resume:
    {raw_text[:4000]}
    """

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000,
                temperature=0.1
            )
            raw = response.choices[0].message.content
            clean = raw.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            clean = clean.strip()
            return json.loads(clean)
        except groq.RateLimitError:
            if attempt < 2:
                time.sleep(2 ** attempt)
            else:
                return get_empty_structure()
        except json.JSONDecodeError:
            if attempt < 2:
                continue
            return get_empty_structure()


def get_empty_structure() -> dict:
    return {
        "name": "",
        "email": "",
        "phone": "",
        "linkedin": "",
        "summary": "",
        "skills": [],
        "experience": [],
        "education": [],
        "projects": []
    }