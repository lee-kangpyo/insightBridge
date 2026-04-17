import pytest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestLoginRequestSchema:
    def test_login_request_valid(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@test.edu", password="password123")
        assert req.email == "user@test.edu"
        assert req.password == "password123"

    def test_login_request_email_field_name(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@test.edu", password="password123")
        assert hasattr(req, "email")
        assert hasattr(req, "password")

    def test_login_response_valid(self):
        from app.schemas import LoginResponse

        resp = LoginResponse(access_token="jwt_token_here", univ_nm="Test University")
        assert resp.access_token == "jwt_token_here"
        assert resp.univ_nm == "Test University"

    def test_login_response_optional_univ(self):
        from app.schemas import LoginResponse

        resp = LoginResponse(access_token="jwt_token_here")
        assert resp.univ_nm is None

    def test_token_payload_valid(self):
        from app.schemas import TokenPayload

        payload = TokenPayload(sub="123", univ_nm="Test University", exp=1234567890)
        assert payload.sub == "123"
        assert payload.univ_nm == "Test University"
        assert payload.exp == 1234567890


class TestEdgeCases:
    def test_email_without_at_symbol(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="invalidemail", password="password")
        assert "@" not in req.email

    def test_email_with_valid_domain(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user.name+tag@university.edu", password="password")
        assert req.email == "user.name+tag@university.edu"
        assert "@university.edu" in req.email

    def test_unicode_email(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@테스트.edu", password="password")
        assert req.email == "user@테스트.edu"

    def test_unicode_password(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@test.edu", password="비밀번호123")
        assert req.password == "비밀번호123"

    def test_very_long_password(self):
        from app.schemas import LoginRequest

        long_password = "a" * 1000
        req = LoginRequest(email="user@test.edu", password=long_password)
        assert len(req.password) == 1000

    def test_special_characters_in_email(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user+filter@gmail.com", password="p@ssw0rd!")
        assert req.email == "user+filter@gmail.com"

    def test_sql_injection_in_email(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="'; DROP TABLE users; --", password="password")
        assert req.email == "'; DROP TABLE users; --"

    def test_sql_injection_in_password(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@test.edu", password="'; DROP TABLE users; --")
        assert req.password == "'; DROP TABLE users; --"

    def test_email_max_length(self):
        from app.schemas import LoginRequest

        long_email = "a" * 200 + "@test.edu"
        req = LoginRequest(email=long_email, password="password")
        assert len(req.email) == 209

    def test_password_with_whitespace(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@test.edu", password="pass word")
        assert req.password == "pass word"

    def test_email_with_subdomain(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@mail.test.edu", password="password")
        assert req.email == "user@mail.test.edu"
        assert "mail.test.edu" in req.email

    def test_email_leading_plus(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="+82user@university.edu", password="password")
        assert req.email == "+82user@university.edu"
        assert req.email.startswith("+")

    def test_password_unicode_korean(self):
        from app.schemas import LoginRequest

        req = LoginRequest(email="user@test.edu", password="안녕하세요")
        assert req.password == "안녕하세요"

    def test_email_case_sensitivity(self):
        from app.schemas import LoginRequest

        req1 = LoginRequest(email="User@Test.edu", password="password")
        req2 = LoginRequest(email="user@test.edu", password="password")
        assert req1.email != req2.email


class TestSchemasExist:
    def test_login_request_exists(self):
        from app.schemas import LoginRequest

        assert LoginRequest is not None

    def test_login_response_exists(self):
        from app.schemas import LoginResponse

        assert LoginResponse is not None

    def test_token_payload_exists(self):
        from app.schemas import TokenPayload

        assert TokenPayload is not None


class TestSignupCreatesGroupUserMapping:
    @pytest.mark.asyncio
    async def test_signup_creates_group_user_mapping(self, mock_db_fetch_df):
        from app.services.auth import get_grp_id_by_grp_cd, insert_grp_user
        import pandas as pd
        from unittest.mock import MagicMock, AsyncMock, patch

        mock_db_fetch_df.side_effect = [
            pd.DataFrame([{"grp_id": 1}]),
        ]

        grp_id = await get_grp_id_by_grp_cd("STDNT")
        assert grp_id == 1

        pool_mock = MagicMock()
        conn_mock = AsyncMock()
        pool_mock.acquire.return_value.__aenter__.return_value = conn_mock

        with patch("app.services.auth.get_pool", return_value=pool_mock):
            await insert_grp_user(user_cd=1, grp_id=1)
            conn_mock.execute.assert_called_once()


class TestNormalizeChipValue:
    def test_normalize_null_returns_dash(self):
        from app.services.auth import _normalize_chip_value

        assert _normalize_chip_value(None) == "-"

    def test_normalize_empty_string_returns_dash(self):
        from app.services.auth import _normalize_chip_value

        assert _normalize_chip_value("") == "-"

    def test_normalize_whitespace_returns_dash(self):
        from app.services.auth import _normalize_chip_value

        assert _normalize_chip_value("   ") == "-"

    def test_normalize_valid_value_returns_trimmed(self):
        from app.services.auth import _normalize_chip_value

        assert _normalize_chip_value("국립") == "국립"
        assert _normalize_chip_value("  사립  ") == "사립"


class TestGetInstitutionChips:
    @pytest.mark.asyncio
    async def test_get_institution_chips_returns_normalized_values(
        self, mock_db_fetch_df
    ):
        from app.services.auth import get_institution_chips
        import pandas as pd

        mock_db_fetch_df.return_value = pd.DataFrame(
            [{"schl_tp": "대학교", "estb_gb": "국립", "region": "서울", "stts": "정상"}]
        )

        result = await get_institution_chips("테스트대학교")

        assert result["schl_tp"] == "대학교"
        assert result["estb_gb"] == "국립"
        assert result["region"] == "서울"
        assert result["stts"] == "정상"

    @pytest.mark.asyncio
    async def test_get_institution_chips_empty_df_returns_all_dashes(
        self, mock_db_fetch_df
    ):
        from app.services.auth import get_institution_chips
        import pandas as pd

        mock_db_fetch_df.return_value = pd.DataFrame([])

        result = await get_institution_chips("없는학교")

        assert result["schl_tp"] == "-"
        assert result["estb_gb"] == "-"
        assert result["region"] == "-"
        assert result["stts"] == "-"

    @pytest.mark.asyncio
    async def test_get_institution_chips_null_values_become_dash(
        self, mock_db_fetch_df
    ):
        from app.services.auth import get_institution_chips
        import pandas as pd

        mock_db_fetch_df.return_value = pd.DataFrame(
            [{"schl_tp": None, "estb_gb": "", "region": "  ", "stts": "정상"}]
        )

        result = await get_institution_chips("테스트대학교")

        assert result["schl_tp"] == "-"
        assert result["estb_gb"] == "-"
        assert result["region"] == "-"
        assert result["stts"] == "정상"


class TestLoginReturnsRoles:
    @pytest.mark.asyncio
    async def test_login_returns_user_roles(self, mock_db_fetch_df):
        from app.services.auth import get_user_roles
        import pandas as pd

        mock_db_fetch_df.return_value = pd.DataFrame(
            [{"grp_cd": "STDNT"}, {"grp_cd": "CLUB"}]
        )

        roles = await get_user_roles(123)
        assert roles == ["STDNT", "CLUB"]

    @pytest.mark.asyncio
    async def test_login_returns_empty_roles_for_user_with_no_groups(
        self, mock_db_fetch_df
    ):
        from app.services.auth import get_user_roles
        import pandas as pd

        mock_db_fetch_df.return_value = pd.DataFrame([])

        roles = await get_user_roles(999)
        assert roles == []

    @pytest.mark.asyncio
    async def test_login_response_has_roles_field(self):
        from app.schemas import LoginResponse

        resp = LoginResponse(access_token="token", roles=["STDNT", "CLUB"])
        assert resp.roles == ["STDNT", "CLUB"]


class TestInstitutionChipsSchema:
    def test_institution_chips_model_exists(self):
        from app.schemas import InstitutionChips

        assert InstitutionChips is not None

    def test_institution_chips_has_four_fields(self):
        from app.schemas import InstitutionChips

        chips = InstitutionChips(schl_tp="x", estb_gb="y", region="z", stts="w")
        assert hasattr(chips, "schl_tp")
        assert hasattr(chips, "estb_gb")
        assert hasattr(chips, "region")
        assert hasattr(chips, "stts")

    def test_login_response_has_institution_chips(self):
        from app.schemas import LoginResponse, InstitutionChips

        chips = InstitutionChips(schl_tp="x", estb_gb="y", region="z", stts="w")
        resp = LoginResponse(
            access_token="token", univ_nm="Univ", institution_chips=chips
        )
        assert resp.institution_chips is not None
        assert resp.institution_chips.schl_tp == "x"

    def test_oauth2_token_response_has_institution_chips(self):
        from app.schemas import OAuth2TokenResponse, InstitutionChips

        chips = InstitutionChips(schl_tp="x", estb_gb="y", region="z", stts="w")
        resp = OAuth2TokenResponse(
            access_token="token", univ_nm="Univ", institution_chips=chips
        )
        assert resp.institution_chips is not None
        assert resp.institution_chips.region == "z"
