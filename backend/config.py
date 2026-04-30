"""
backend/config.py
─────────────────
Application-level configuration.

FIXED: No longer raises ValueError on missing GROQ_API_KEY at import time.
       Auth routes do NOT need the Groq key, so a missing key should only
       block the AI features, not bring the whole server down.
       Services that need GROQ_API_KEY validate it at call time.
"""
import os
import logging

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY: str | None = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.warning(
        "GROQ_API_KEY is not set. AI enhancement features will be unavailable. "
        "Set GROQ_API_KEY in your .env file to enable them."
    )