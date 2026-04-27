import os
import uuid
from jinja2 import Environment, FileSystemLoader

# Blindspot 7 fix: absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "..", "templates")

os.makedirs("outputs", exist_ok=True)

# Blindspot 3 fix: escape LaTeX special chars
def escape_latex(text: str) -> str:
    if not text:
        return ""
    replacements = {
        '&': r'\&',
        '%': r'\%',
        '$': r'\$',
        '#': r'\#',
        '_': r'\_',
        '{': r'\{',
        '}': r'\}',
        '~': r'\textasciitilde{}',
        '^': r'\^{}',
    }
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    return text

def prepare_data(data: dict) -> dict:
    return {
        "name": escape_latex(data.get("name", "Your Name")),
        "email": escape_latex(data.get("email", "")),
        "phone": escape_latex(data.get("phone", "")),
        "linkedin": data.get("linkedin", ""),
        "summary": escape_latex(data.get("summary", "")),
        "skills_str": escape_latex(
            ", ".join(data.get("enhanced_skills", []))
        ),
        "enhanced_bullets": [
            escape_latex(b)
            for b in data.get("enhanced_bullets", [])
        ],
        "education": data.get("education", []),
    }

def generate_latex(data: dict) -> str:
    # Blindspot 4 fix: custom delimiters
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        block_start_string="((*",
        block_end_string="*))",
        variable_start_string="(((", 
        variable_end_string=")))",
        comment_start_string="((#",
        comment_end_string="#))",
    )

    template = env.get_template("jakes_resume.tex")
    prepared = prepare_data(data)
    rendered = template.render(data=prepared)

    file_id = str(uuid.uuid4())
    output_path = f"outputs/{file_id}.tex"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(rendered)

    return file_id