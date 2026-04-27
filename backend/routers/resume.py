from fastapi import APIRouter, UploadFile, HTTPException
from services.pdf_parser import parse_resume
from utils.file_handler import save_upload

router = APIRouter(prefix="/resume", tags=["Resume"])

ALLOWED_TYPES = ["application/pdf"]

@router.post("/scan")
async def scan_resume(file: UploadFile):
    # Blindspot 4: extension check alone is bypassable
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, "PDF files only.")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "File must have .pdf extension.")

    try:
        content = await file.read()
        path = save_upload(content, file.filename)
        return parse_resume(path)
    except ValueError as e:
        raise HTTPException(422, str(e))