from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="PRAMAAN_", extra="ignore")
    app_name: str = "PRAMAAN API"
    app_version: str = "0.1.0"
    environment: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = "postgresql+asyncpg://pramaan:pramaan@postgres:5432/pramaan"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    redis_url: str = "redis://redis:6379/0"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    jwt_secret_key: str = Field(default="change-this-in-production-use-32-bytes", min_length=32)
    jwt_issuer: str = "pramaan-api"
    jwt_audience: str = "pramaan-web"
    access_token_minutes: int = 10
    refresh_token_days: int = 7
    auth_cookie_secure: bool = True
    login_max_failures: int = 5
    login_lockout_minutes: int = 30
    password_reset_minutes: int = 15
    ollama_url: str = "http://ollama:11434"
    ollama_model: str = "llama3.1:8b"
    ai_query_timeout_ms: int = 10_000
    ai_max_rows: int = 500

    @model_validator(mode="after")
    def production_secrets(self) -> "Settings":
        if self.environment == "production" and self.jwt_secret_key == "change-this-in-production-use-32-bytes":
            raise ValueError("PRAMAAN_JWT_SECRET_KEY must be configured in production")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
