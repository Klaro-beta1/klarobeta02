from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://localhost:5432/nail_db"
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "nail_db"

    # JWT
    JWT_SECRET_KEY: str = "your_super_secret_key_minimum_32_characters_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DAYS: int = 30

    # API Keys
    FIRECRAWL_API_KEY: str = "fc-41eadac06fda46b49462525b2b26f7e6"
    CLAUDE_API_KEY: str = "hrp-fPoa-HPMIUpQyfS0xhE3oEKn1a2BrNELjvhH4BkeD1iVYu0J9bVqLmnhGDTh"

    # OpenAI-compatible API (alternative to Claude)
    OPENAI_API_KEY: Optional[str] = "a23d5ef0e9cf4afca9964bd31058799c.Q3bOHu9GmujrdYPd"
    OPENAI_BASE_URL: str = "https://api.deepseek.com/v1"  # DeepSeek API endpoint

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Stripe (not functional for MVP)
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Frontend URL
    FRONTEND_URL: str = "http://localhost:3000"

    # Admin account
    ADMIN_EMAIL: str = "mihirbhut07@gmail.com"
    ADMIN_PASSWORD: str = "mihirthegre@t1"

    # UPI for manual payments
    UPI_ID: str = "mihirbhut08@okaxis"

    # Demo Mode (uses mock AI when API keys are invalid)
    DEMO_MODE: bool = True  # Set to False when you have working API keys

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
