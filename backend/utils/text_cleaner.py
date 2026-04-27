import re

def clean_resume_text(text: str) -> str:
    # Fix ligatures pdfplumber often mangles
    text = text.replace("ﬁ", "fi").replace("ﬂ", "fl")
    # Collapse excessive whitespace but preserve newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()