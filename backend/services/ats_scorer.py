import re
from typing import List

def _normalize(text: str) -> str:
    """Lowercase + collapse whitespace for fair matching."""
    return re.sub(r'\s+', ' ', text.lower().strip())

def _keyword_in_resume(keyword: str, resume_lower: str) -> bool:
    """
    Blindspot fix: whole-word matching only.
    'Java' should NOT match inside 'JavaScript'.
    """
    pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
    return bool(re.search(pattern, resume_lower))

def calculate_ats_score(
    resume_text: str,
    must_have: List[str],
    nice_to_have: List[str],
    top_keywords: List[str]
) -> dict:
    resume_lower = _normalize(resume_text)

    # Blindspot fix: deduplicate keywords before scoring
    # (duplicate must-haves inflate total and distort %)
    must_have   = list(dict.fromkeys(must_have))
    nice_to_have = list(dict.fromkeys(nice_to_have))
    top_keywords = list(dict.fromkeys(top_keywords))

    matched_must  = [k for k in must_have    if _keyword_in_resume(k, resume_lower)]
    missing_must  = [k for k in must_have    if not _keyword_in_resume(k, resume_lower)]
    matched_nice  = [k for k in nice_to_have if _keyword_in_resume(k, resume_lower)]
    missing_nice  = [k for k in nice_to_have if not _keyword_in_resume(k, resume_lower)]
    matched_top   = [k for k in top_keywords if _keyword_in_resume(k, resume_lower)]

    # Weighted: must-haves = 70%, nice-to-haves = 30%
    must_score = (len(matched_must) / len(must_have) * 70) if must_have else 70
    nice_score = (len(matched_nice) / len(nice_to_have) * 30) if nice_to_have else 30
    total = round(must_score + nice_score, 1)

    # Blindspot fix: clamp score to [0, 100]
    total = max(0.0, min(100.0, total))

    return {
        "ats_score": total,
        "verdict": (
            "Strong match"   if total >= 75 else
            "Moderate match" if total >= 50 else
            "Weak match"
        ),
        "matched_must_have":    matched_must,
        "missing_must_have":    missing_must,
        "matched_nice_to_have": matched_nice,
        "missing_nice_to_have": missing_nice,
        "matched_top_keywords": matched_top,
        "priority_gaps": missing_must[:5],  # Top 5 to fix first
        "score_breakdown": {
            "must_have_score": round(must_score, 1),
            "nice_to_have_score": round(nice_score, 1),
            "must_matched": f"{len(matched_must)}/{len(must_have)}",
            "nice_matched": f"{len(matched_nice)}/{len(nice_to_have)}",
        }
    }