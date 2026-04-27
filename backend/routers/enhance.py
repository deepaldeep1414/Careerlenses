# backend/routers/enhance.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.resume_enhancer import enhance_resume

router = APIRouter(prefix="/enhance", tags=["Enhance"])

class EnhanceRequest(BaseModel):
    raw_text: str
    missing_keywords: List[str]
    job_title: str

@router.post("/")
def enhance(payload: EnhanceRequest):
    return enhance_resume(
        payload.raw_text,
        payload.missing_keywords,
        payload.job_title
    )