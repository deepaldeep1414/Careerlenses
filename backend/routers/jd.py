from fastapi import APIRouter
from models.jd_models import JDInput
from services.jd_extractor import extract_jd_keywords

router = APIRouter(
    prefix="/jd",
    tags=["JD Analyzer"]
)

@router.post("/analyze")
def analyze_jd(payload: JDInput):
    return extract_jd_keywords(payload.text)