"""Shared Gemini chat-model factory used by every AI module."""
import os
from typing import Optional

from langchain_google_genai import ChatGoogleGenerativeAI

MODEL_NAME = "gemini-2.5-flash"


def get_api_key() -> Optional[str]:
    return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")


def get_llm(temperature: Optional[float] = None) -> ChatGoogleGenerativeAI:
    """Build a Gemini chat model with shared defaults (retries, timeout)."""
    api_key = get_api_key()
    if not api_key:
        print("Warning: GEMINI_API_KEY not found in environment. AI features will fail.")

    kwargs = {
        "model": MODEL_NAME,
        "google_api_key": api_key or "dummy_key_for_dev_startup",
        "max_retries": 2,
        "timeout": 60,
    }
    if temperature is not None:
        kwargs["temperature"] = temperature
    return ChatGoogleGenerativeAI(**kwargs)
