import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.docx_generator import generate_docx
from services.latex_generator import generate_latex

router = APIRouter(
    prefix="/export",
    tags=["Export"]
)

@router.post("/generate-docx")
async def create_docx(data: dict):
    try:
        file_id = generate_docx(data)
        return {"file_id": file_id, "format": "docx"}
    except Exception as e:
        raise HTTPException(500, f"DOCX generation failed: {str(e)}")

@router.post("/generate-latex")
async def create_latex(data: dict):
    try:
        file_id = generate_latex(data)
        return {"file_id": file_id, "format": "tex"}
    except Exception as e:
        raise HTTPException(500, f"LaTeX generation failed: {str(e)}")

@router.get("/download/docx/{file_id}")
async def download_docx(file_id: str):
    path = f"outputs/{file_id}.docx"
    if not os.path.exists(path):
        raise HTTPException(404, "File not found or expired.")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-"
                   "officedocument.wordprocessingml.document",
        filename="careerlenses_resume.docx"
    )

@router.get("/download/latex/{file_id}")
async def download_latex(file_id: str):
    path = f"outputs/{file_id}.tex"
    if not os.path.exists(path):
        raise HTTPException(404, "File not found or expired.")
    return FileResponse(
        path,
        media_type="application/x-tex",
        filename="careerlenses_resume.tex"
    )
    