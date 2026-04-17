import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestSearchUsers:
    @pytest.mark.asyncio
    async def test_search_users_returns_list(self):
        from app.services.admin import search_users

        with patch("app.services.admin.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame(
                [
                    {
                        "user_cd": 1,
                        "user_id": "test@cnu.ac.kr",
                        "user_nm": "테스트",
                        "grp_id": 1,
                        "grp_nm": "학생",
                    }
                ]
            )

            result = await search_users("test")
            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]["user_id"] == "test@cnu.ac.kr"

    @pytest.mark.asyncio
    async def test_search_users_empty_result(self):
        from app.services.admin import search_users

        with patch("app.services.admin.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([])

            result = await search_users("nonexistent")
            assert result == []


class TestUpdateUserRole:
    @pytest.mark.asyncio
    async def test_update_user_role(self):
        from app.services.admin import update_user_role

        pool_mock = MagicMock()
        conn_mock = AsyncMock()
        pool_mock.acquire.return_value.__aenter__.return_value = conn_mock

        with patch("app.services.admin.get_pool", return_value=pool_mock):
            await update_user_role(user_cd=1, grp_id=2)
            assert conn_mock.execute.call_count == 2


class TestGetAllMenus:
    @pytest.mark.asyncio
    async def test_get_all_menus_returns_list(self):
        from app.services.admin import get_all_menus

        with patch("app.services.admin.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame(
                [
                    {
                        "menu_id": 1,
                        "menu_cd": "MENU001",
                        "menu_nm": "종합현황",
                        "parent_menu_id": 0,
                        "menu_level": 1,
                        "menu_path": "/overview",
                        "sort_order": 1,
                    }
                ]
            )

            result = await get_all_menus()
            assert isinstance(result, list)
            assert len(result) == 1
            assert result[0]["menu_nm"] == "종합현황"

    @pytest.mark.asyncio
    async def test_get_all_menus_empty(self):
        from app.services.admin import get_all_menus

        with patch("app.services.admin.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([])

            result = await get_all_menus()
            assert result == []


class TestToggleRoleMenu:
    @pytest.mark.asyncio
    async def test_toggle_role_menu_enable(self):
        from app.services.admin import toggle_role_menu

        pool_mock = MagicMock()
        conn_mock = AsyncMock()
        pool_mock.acquire.return_value.__aenter__.return_value = conn_mock

        with patch("app.services.admin.get_pool", return_value=pool_mock):
            await toggle_role_menu(menu_id=1, grp_id=2, enabled=True)
            conn_mock.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_toggle_role_menu_disable(self):
        from app.services.admin import toggle_role_menu

        pool_mock = MagicMock()
        conn_mock = AsyncMock()
        pool_mock.acquire.return_value.__aenter__.return_value = conn_mock

        with patch("app.services.admin.get_pool", return_value=pool_mock):
            await toggle_role_menu(menu_id=1, grp_id=2, enabled=False)
            conn_mock.execute.assert_called_once()


class TestSysAdmAuthorization:
    @pytest.mark.asyncio
    async def test_admin_endpoints_require_sys_adm_role(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.services.auth import create_access_token

        client = TestClient(app)

        token_without_sys_adm = create_access_token(
            data={"sub": "1", "univ_nm": "Test Univ", "roles": ["EMP"]}
        )

        # Test GET /api/admin/users without SYS_ADM role
        response = client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {token_without_sys_adm}"},
        )
        assert response.status_code == 403
        assert "SYS_ADM role required" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_admin_endpoints_allow_sys_adm_role(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.services.auth import create_access_token
        from unittest.mock import patch, AsyncMock
        import pandas as pd

        client = TestClient(app)

        token_with_sys_adm = create_access_token(
            data={"sub": "1", "univ_nm": "Test Univ", "roles": ["SYS_ADM"]}
        )

        with patch("app.services.admin.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame([])

            # Test that the endpoint doesn't return 403 for SYS_ADM users
            response = client.get(
                "/api/admin/users",
                headers={"Authorization": f"Bearer {token_with_sys_adm}"},
            )
            # Should not be 403 (should succeed or fail with a different error, but not authz denial)
            assert response.status_code != 403
