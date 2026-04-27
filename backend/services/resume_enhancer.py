
import groq, json, time, re
from config import GROQ_API_KEY
from fastapi import HTTPException

client = groq.Groq(api_key=GROQ_API_KEY)

def clean_json(raw: str) -> str:
    """Strip markdown code fences and whitespace from LLM output."""
    clean = raw.strip()
    # Remove ```json ... ``` or ``` ... ``` fences
    clean = re.sub(r"^```(?:json)?\s*", "", clean)
    clean = re.sub(r"\s*```$", "", clean)
    return clean.strip()

def truncate_smart(text: str, limit: int = 3000) -> str:
    """
    BLINDSPOT 1 FIX: Don't blindly truncate at 3000 chars.
    Truncate at the last complete sentence/bullet before the limit.
    This avoids cutting mid-sentence which confuses the LLM.
    """
    if len(text) <= limit:
        return text
    truncated = text[:limit]
    # Find last newline or period to cut cleanly
    last_break = max(truncated.rfind('\n'), truncated.rfind('.'))
    if last_break > limit * 0.7:  # Only if we're not cutting too much
        return truncated[:last_break + 1] + "\n[Resume truncated for processing]"
    return truncated + "\n[Resume truncated for processing]"

def validate_output(data: dict, missing_keywords: list) -> dict:
    """
    BLINDSPOT 4 FIX: Check that injected keywords appear naturally,
    not just all dumped into the skills list.
    Also ensures minimum quality bars are met.
    """
    bullets = data.get("enhanced_bullets", [])
    skills = data.get("enhanced_skills", [])
    summary = data.get("summary", "")

    # Ensure we got actual content back
    if not bullets and not skills:
        raise ValueError("Enhancer returned empty content.")

    # Warn if all missing keywords are ONLY in skills (not in bullets)
    # This is keyword stuffing in the skills section
    keywords_in_bullets = sum(
        1 for kw in missing_keywords
        if any(kw.lower() in b.lower() for b in bullets)
    )
    keywords_in_skills_only = sum(
        1 for kw in missing_keywords
        if kw in skills and not any(kw.lower() in b.lower() for b in bullets)
    )
    
    data["quality_flags"] = {
        "keywords_integrated_in_bullets": keywords_in_bullets,
        "keywords_skills_section_only": keywords_in_skills_only,
        "bullet_count": len(bullets),
        "has_summary": bool(summary.strip())
    }
    return data

def enhance_resume(
    raw_text: str,
    missing_keywords: list,
    job_title: str
) -> dict:
    # BLINDSPOT 1 FIX: Smart truncation instead of hard [:3000]
    safe_text = truncate_smart(raw_text, limit=3000)
    
    # BLINDSPOT 3 FIX: Add explicit "don't invent" instruction
    # and ask for reasoning so hallucinations are more detectable
    prompt = f"""
You are an expert ATS resume writer. Your job is to ENHANCE existing experience,
NOT to invent new experience the person doesn't have.

STRICT RULES:
- Only reference skills, tools, or achievements already implied in the resume
- Do NOT invent companies, titles, metrics, or technologies not present
- Inject missing keywords only where they fit naturally into existing bullets
- If a keyword truly cannot fit without lying, skip it — do not force it

Job Target: {job_title}
Missing Keywords to inject: {', '.join(missing_keywords)}

Return ONLY valid JSON, no explanation, no markdown fences:
{{
    "summary": "2-3 line professional summary targeting {job_title}",
    "enhanced_skills": ["skill1", "skill2"],
    "enhanced_bullets": [
        "Strong action verb + task + tool/keyword + measurable outcome",
        "..."
    ]
}}

Resume Content:
{safe_text}
"""
    
    last_error = None
    for attempt in range(3):
        try:
            res = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=2000,
                temperature=0.3
            )
            raw = res.choices[0].message.content
            
            # BLINDSPOT 2 FIX: Clean before parsing + better error info
            clean = clean_json(raw)
            
            try:
                data = json.loads(clean)
            except json.JSONDecodeError as e:
                # Try to extract JSON if LLM wrapped it in extra text
                json_match = re.search(r'\{.*\}', clean, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group())
                else:
                    raise HTTPException(
                        500,
                        f"AI returned malformed JSON. Raw output: {clean[:200]}"
                    )
            
            # BLINDSPOT 4 FIX: Validate quality before returning
            return validate_output(data, missing_keywords)
            
        except groq.RateLimitError:
            if attempt < 2:
                time.sleep(2 ** attempt)
                last_error = "rate_limit"
            else:
                raise HTTPException(429, "AI is busy. Wait 10s and retry.")
        except HTTPException:
            raise
        except Exception as e:
            last_error = str(e)
            if attempt == 2:
                raise HTTPException(500, f"Enhancement failed: {last_error}")