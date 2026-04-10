from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    openai_api_key: str
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    llm_provider: str = "openai"
    llm_temperature: float = 0.0
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
