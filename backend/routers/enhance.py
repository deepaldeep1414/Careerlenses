from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from services.resume_enhancer import enhance_resume
from utils.security import get_current_user

router = APIRouter(prefix="/enhance", tags=["Enhance"])

class EnhanceRequest(BaseModel):
    raw_text: str
    missing_keywords: List[str]
    job_title: str
    structured_resume: Optional[Dict[str, Any]] = None

@router.post("/")
def enhance(
    payload: EnhanceRequest,
    _: dict = Depends(get_current_user),   # 🔒 JWT required
):
    return enhance_resume(
        payload.raw_text,
        payload.missing_keywords,
        payload.job_title,
        payload.structured_resume
    )