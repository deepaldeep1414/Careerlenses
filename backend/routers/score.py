# backend/routers/score.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.ats_scorer import calculate_ats_score

router = APIRouter(prefix="/score", tags=["Score"])

class ScoreRequest(BaseModel):
    resume_text: str
    must_have_skills: List[str]
    nice_to_have_skills: List[str]
    top_keywords: List[str]

@router.post("/ats")
def ats_score(payload: ScoreRequest):
    return calculate_ats_score(
        resume_text=payload.resume_text,
        must_have=payload.must_have_skills,
        nice_to_have=payload.nice_to_have_skills,
        top_keywords=payload.top_keywords
    )