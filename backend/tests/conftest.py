import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def mock_db_fetch_df():
    with patch("app.services.auth.fetch_df") as mock:
        yield mock


@pytest.fixture
def mock_user_data():
    return pd.DataFrame(
        [
            {
                "user_cd": 1,
                "user_id": "student@university.edu",
                "user_pw": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDAo7Z5lJqO8.",  # "password123" hashed
                "user_nm": "Test Student",
            }
        ]
    )


@pytest.fixture
def mock_univ_data():
    return pd.DataFrame([{"univ_nm": "Test University"}])


@pytest.fixture
def mock_empty_data():
    return pd.DataFrame([])
