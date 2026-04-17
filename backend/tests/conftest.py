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
