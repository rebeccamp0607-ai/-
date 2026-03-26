"""Application configuration via environment variables."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App
    DEBUG: bool = False
    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://ming:ming@localhost:5432/ming"
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI（OpenAI 兼容接口，支持 SiliconFlow / DeepSeek / OpenAI）
    AI_API_KEY: str = ""
    AI_BASE_URL: str = "https://api.siliconflow.cn/v1"
    AI_MODEL_FAST: str = "Qwen/Qwen2.5-7B-Instruct"
    AI_MODEL_STRONG: str = "Qwen/Qwen2.5-72B-Instruct"

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX: str = "ming-destiny-vectors"

    # O2O 导出
    NOTION_CLIENT_ID: str = ""
    NOTION_CLIENT_SECRET: str = ""
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""


settings = Settings()
