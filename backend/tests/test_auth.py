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
