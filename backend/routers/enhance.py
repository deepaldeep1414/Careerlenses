from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.resume_enhancer import enhance_resume

router = APIRouter(prefix="/enhance", tags=["Enhance"])

class EnhanceRequest(BaseModel):
    raw_text: str
    missing_keywords: List[str]
    job_title: str
    structured_resume: Optional[Dict[str, Any]] = None

@router.post("/")
def enhance(payload: EnhanceRequest):
    return enhance_resume(
        payload.raw_text,
        payload.missing_keywords,
        payload.job_title,
        payload.structured_resume
    )