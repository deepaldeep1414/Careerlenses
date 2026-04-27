import groq
import json
import time
from fastapi import HTTPException
from config import GROQ_API_KEY

client = groq.Groq(api_key=GROQ_API_KEY)

def enhance_resume(
    raw_text: str,
    missing_keywords: list,
    job_title: str,
    structured_resume: dict = None
) -> dict:

    if not structured_resume:
        return {
            "summary": "",
            "enhanced_skills": [],
            "enhanced_bullets": [],
            "enhanced_experience": [],
            "enhanced_projects": []
        }

    experience = structured_resume.get("experience", [])
    projects = structured_resume.get("projects", [])
    skills = structured_resume.get("skills", [])
    summary = structured_resume.get("summary", "")

    prompt = f"""
    You are an expert ATS resume writer.

    Job Target: {job_title}
    Missing Keywords to naturally inject: {', '.join(missing_keywords[:10])}

    Your task: Enhance ONLY the bullet points in experience and projects.
    Keep everything else EXACTLY the same.

    Rules:
    - Only rewrite bullet points
    - Naturally inject missing keywords where relevant
    - Start bullets with strong action verbs
    - Add metrics where possible
    - DO NOT invent experience or skills
    - Keep original meaning intact
    - Return ONLY valid JSON

    Return this exact structure:
    {{
        "enhanced_experience": [
            {{
                "company": "same as original",
                "title": "same as original",
                "dates": "same as original",
                "bullets": ["enhanced bullet 1", "enhanced bullet 2"]
            }}
        ],
        "enhanced_projects": [
            {{
                "name": "same as original",
                "description": "same as original",
                "bullets": ["enhanced bullet 1"]
            }}
        ],
        "enhanced_skills": ["skill1", "skill2"],
        "summary": "slightly enhanced summary with keywords"
    }}

    Original Experience:
    {json.dumps(experience, indent=2)}

    Original Projects:
    {json.dumps(projects, indent=2)}

    Original Skills:
    {json.dumps(skills)}

    Original Summary:
    {summary}
    """

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=3000,
                temperature=0.2
            )
            raw = response.choices[0].message.content
            clean = raw.strip()
            if clean.startswith("```"):
                clean = clean.split("```")[1]
                if clean.startswith("json"):
                    clean = clean[4:]
            clean = clean.strip()
            result = json.loads(clean)

            all_bullets = []
            for exp in result.get("enhanced_experience", []):
                all_bullets.extend(exp.get("bullets", []))
            result["enhanced_bullets"] = all_bullets

            return result

        except groq.RateLimitError:
            if attempt < 2:
                time.sleep(2 ** attempt)
            else:
                raise HTTPException(429, "AI busy. Try again.")
        except json.JSONDecodeError:
            if attempt < 2:
                continue
            raise HTTPException(500, "Enhancement failed. Retry.")