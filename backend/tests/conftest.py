import os
import uuid
from typing import AsyncIterator

import asyncpg
import pytest
from httpx import ASGITransport, AsyncClient

from app.dependencies import require_sys_adm
from app.main import app


@pytest.fixture(scope="session")
def database_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        pytest.skip("DATABASE_URL is not set (needed for integration tests)")
    return url


@pytest.fixture
async def db(database_url: str) -> AsyncIterator[asyncpg.Connection]:
    conn = await asyncpg.connect(database_url)
    try:
        yield conn
    finally:
        await conn.close()


@pytest.fixture
def sys_adm_override():
    async def _override():
        return {"user_cd": "0", "univ_nm": "TEST", "roles": ["SYS_ADM"]}

    return _override


@pytest.fixture
async def client(sys_adm_override) -> AsyncIterator[AsyncClient]:
    app.dependency_overrides[require_sys_adm] = sys_adm_override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
    app.dependency_overrides.pop(require_sys_adm, None)


@pytest.fixture
def run_id() -> str:
    return uuid.uuid4().hex[:10]

import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def mock_settings():
    mock_config = MagicMock()
    mock_config.domain_validation_enabled = True
    mock_config.database_url = "postgresql://test:test@localhost/test"
    mock_config.openai_api_key = "test-key"
    mock_config.jwt_secret_key = "test-secret"
    mock_config.jwt_algorithm = "HS256"
    mock_config.smtp_host = "localhost"
    mock_config.smtp_port = 587
    mock_config.smtp_user = "test"
    mock_config.smtp_password = "test"
    mock_config.openai_base_url = "https://api.openai.com/v1"
    mock_config.openai_model = "gpt-4"
    mock_config.llm_provider = "openai"
    mock_config.llm_temperature = 0.0
    with patch("app.config.settings", mock_config):
        yield mock_config


@pytest.fixture
def mock_db_fetch_df():
    with patch("app.services.auth.fetch_df", new_callable=AsyncMock) as mock:
        yield mock
