from pydantic import BaseModel
from typing import List

class ResumeData(BaseModel):
    raw_text: str
    word_count: int
    page_count: int
    is_valid: bool
    message: str