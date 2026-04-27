import pdfplumber
from utils.text_cleaner import clean_resume_text

def parse_resume(file_path: str) -> dict:
    text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text(x_tolerance=3, y_tolerance=3)
            if extracted:
                text += extracted + "\n"

    # Blindspot 1: image-based PDF (scanned resume)
    if len(text.strip()) < 100:
        raise ValueError(
            "PDF appears to be image-based or scanned. "
            "Please upload a text-based PDF. "
            "Tip: Export from Google Docs/Word, not a scan."
        )

    cleaned = clean_resume_text(text)

    # Blindspot 2: multi-column layout breaks text order
    # pdfplumber reads columns left-to-right, line-by-line
    # which mixes two-column resumes. Flag it for the user.
    has_column_issue = _detect_column_layout(cleaned)

    return {
        "raw_text": cleaned,
        "char_count": len(cleaned),
        "warning": (
            "Multi-column layout detected. "
            "ATS parsing may be less accurate. "
            "Consider a single-column resume format."
            if has_column_issue else None
        )
    }

def _detect_column_layout(text: str) -> bool:
    """
    Heuristic: if many short lines exist back-to-back,
    likely a two-column layout was read horizontally.
    """
    lines = [l for l in text.split('\n') if l.strip()]
    short_lines = [l for l in lines if len(l.strip()) < 40]
    return len(short_lines) / max(len(lines), 1) > 0.6