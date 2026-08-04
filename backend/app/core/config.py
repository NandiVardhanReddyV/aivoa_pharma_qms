import os

class Settings:
    PROJECT_NAME: str = "AIVOA Pharma QMS - AI Customer Complaint Management System"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./qms_complaints.db")
    
    # LLM & Groq Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("GROQ_MODEL", "gemma2-9b-it")
    VERSATILE_MODEL: str = "llama-3.3-70b-versatile"
    
    # Regulatory Controls
    FDA_ALERT_TIMEFRAME_DAYS: int = 15

settings = Settings()
