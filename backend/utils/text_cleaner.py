import re

def clean_text(text: str) -> str:
    # Remove extra whitespace
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    # Remove special characters that break JSON
    text = text.replace('\x00', '')
    return text.strip()