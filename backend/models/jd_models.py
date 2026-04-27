from pydantic import BaseModel
from typing import List

class JDInput(BaseModel):
    text: str

class JDAnalysis(BaseModel):
    job_title: str
    seniority_level: str
    must_have_skills: List[str]
    nice_to_have_skills: List[str]
    top_keywords: List[str]