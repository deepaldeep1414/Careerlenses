import os
import uuid
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

os.makedirs("outputs", exist_ok=True)

def generate_docx(data: dict) -> str:
    doc = Document()

    # Page margins — ATS safe
    section = doc.sections[0]
    section.top_margin = Pt(36)
    section.bottom_margin = Pt(36)
    section.left_margin = Pt(54)
    section.right_margin = Pt(54)

    # Blindspot 6 fix: safe defaults
    name = data.get("name", "Your Name")
    email = data.get("email", "")
    phone = data.get("phone", "")
    skills = data.get("enhanced_skills", [])
    bullets = data.get("enhanced_bullets", [])
    summary = data.get("summary", "")

    # --- Name ---
    name_para = doc.add_paragraph()
    name_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = name_para.add_run(name)
    run.bold = True
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor(0, 0, 0)

    # --- Contact ---
    if email or phone:
        contact = doc.add_paragraph()
        contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contact.add_run(f"{email}  |  {phone}")
        contact.runs[0].font.size = Pt(10)

    # --- Summary ---
    if summary:
        doc.add_paragraph()
        s_head = doc.add_paragraph()
        s_run = s_head.add_run("PROFESSIONAL SUMMARY")
        s_run.bold = True
        s_run.font.size = Pt(11)
        doc.add_paragraph(summary).runs[0].font.size = Pt(10)

    # --- Skills ---
    if skills:
        doc.add_paragraph()
        sk_head = doc.add_paragraph()
        sk_run = sk_head.add_run("TECHNICAL SKILLS")
        sk_run.bold = True
        sk_run.font.size = Pt(11)
        skills_para = doc.add_paragraph(", ".join(skills))
        skills_para.runs[0].font.size = Pt(10)

    # --- Experience Bullets ---
    if bullets:
        doc.add_paragraph()
        exp_head = doc.add_paragraph()
        exp_run = exp_head.add_run("EXPERIENCE")
        exp_run.bold = True
        exp_run.font.size = Pt(11)
        for bullet in bullets:
            # Blindspot 2 fix: no tables, plain bullets
            p = doc.add_paragraph(style="List Bullet")
            p.add_run(bullet).font.size = Pt(10)

    # Save output
    file_id = str(uuid.uuid4())
    output_path = f"outputs/{file_id}.docx"
    doc.save(output_path)
    return file_id