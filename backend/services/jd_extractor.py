import groq
import json
import time
from fastapi import HTTPException
from config import GROQ_API_KEY

client = groq.Groq(api_key=GROQ_API_KEY)

def extract_jd_keywords(jd_text: str) -> dict:
    
    # Blindspot 3 fix: validate input
    if len(jd_text.strip()) < 100:
        raise HTTPException(
            status_code=400,
            detail="Job description too short. "
                   "Please paste the full JD."
        )
    
    prompt = f"""
    Analyze this job description carefully.
    Return ONLY valid JSON, no explanation, 
    no markdown, no extra text whatsoever.
    
    Return exactly this structure:
    {{
        "job_title": "exact job title from JD",
        "seniority_level": "Junior/Mid/Senior/Lead",
        "must_have_skills": ["skill1", "skill2"],
        "nice_to_have_skills": ["skill1", "skill2"],
        "top_keywords": ["keyword1", "keyword2"]
    }}
    
    Rules:
    - must_have_skills: skills explicitly required
    - nice_to_have_skills: skills mentioned as bonus
    - top_keywords: top 10 keywords ranked by importance
    - Return ONLY the JSON object, nothing else
    
    Job Description:
    {jd_text}
    """
    
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.1  # Blindspot 2 fix
            )
            
            raw = response.choices[0].message.content
            
            # Blindspot 1 fix: strip markdown
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
                continue
            raise HTTPException(
                status_code=429,
                detail="AI service busy. Please try again."
            )
        except json.JSONDecodeError as e:
            if attempt < 2:
                continue
            raise HTTPException(
                status_code=500,
                detail="AI returned invalid response. "
                       "Please try again."
            )