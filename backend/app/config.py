from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# 이 파일 기준 backend/.env — uvicorn cwd가 레포 루트여도 동일하게 로드
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    domain_validation_enabled: bool = True
    debug: bool = False
    allowed_origins: list[str] = ["*"]

    # 쿠키 기반 인증 설정
    auth_cookie_name: str = "auth_token"
    auth_cookie_secure: bool = True
    auth_cookie_samesite: str = "lax"
    auth_cookie_max_age: int = 3600

    database_url: str
    openai_api_key: str
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    llm_provider: str = "openai"
    llm_temperature: float = 0.0
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str


settings = Settings()
