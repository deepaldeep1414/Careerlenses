import os, uuid
from fastapi import HTTPException

UPLOAD_DIR = "uploads"
MAX_SIZE_MB = 5
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload(file_bytes: bytes, filename: str) -> str:
    # Blindspot 3: no file size limit = server can be abused
    if len(file_bytes) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"File too large. Max {MAX_SIZE_MB}MB.")

    unique = f"{uuid.uuid4()}_{filename}"
    path = os.path.join(UPLOAD_DIR, unique)
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path


