import pytest
import sys
import os
from unittest.mock import AsyncMock, patch
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class TestGetUserMenus:
    @pytest.mark.asyncio
    async def test_get_user_menus_returns_menu_tree(self):
        from app.services.menu import get_user_menus

        with patch("app.services.menu.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame(
                [
                    {
                        "menu_id": 1,
                        "menu_nm": "Dashboard",
                        "parent_menu_id": None,
                        "sort_order": 1,
                    },
                    {
                        "menu_id": 2,
                        "menu_nm": "Analytics",
                        "parent_menu_id": 1,
                        "sort_order": 1,
                    },
                ]
            )

            result = await get_user_menus(user_cd=123)

            assert "menu_tree" in result
            assert isinstance(result["menu_tree"], list)
            assert len(result["menu_tree"]) == 1
            assert len(result["menu_tree"][0]["children"]) == 1


class TestTreeifyMenus:
    def test_treeify_menus(self):
        from app.services.menu import treeify

        flat_menus = [
            {"menu_id": 1, "menu_nm": "종합현황", "parent_menu_id": 0},
            {"menu_id": 9, "menu_nm": "서브1", "parent_menu_id": 1},
            {"menu_id": 10, "menu_nm": "서브2", "parent_menu_id": 1},
        ]

        result = treeify(flat_menus)

        assert len(result) == 1
        assert result[0]["menu_id"] == 1
        assert result[0]["menu_nm"] == "종합현황"
        assert len(result[0]["children"]) == 2
        child_ids = {c["menu_id"] for c in result[0]["children"]}
        assert child_ids == {9, 10}

    def test_treeify_menus_orphaned_children(self):
        from app.services.menu import treeify

        flat_menus = [
            {"menu_id": 1, "menu_nm": "Root", "parent_menu_id": 0},
            {"menu_id": 2, "menu_nm": "Orphan", "parent_menu_id": 999},
        ]

        result = treeify(flat_menus)

        assert len(result) == 1
        assert result[0]["menu_id"] == 1

    def test_treeify_menus_empty(self):
        from app.services.menu import treeify

        result = treeify([])
        assert result == []


class TestMenuServiceEndpoint:
    @pytest.mark.asyncio
    async def test_get_user_menus_endpoint_requires_auth(self):
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)
        response = client.get("/api/users/me/menus")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_user_menus_endpoint_with_auth(self, mock_settings):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.services.auth import create_access_token
        import pandas as pd

        token = create_access_token(data={"sub": "123", "univ_nm": "Test University"})

        with patch("app.services.menu.fetch_df", new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = pd.DataFrame(
                [
                    {
                        "menu_id": 1,
                        "menu_nm": "Dashboard",
                        "parent_menu_id": None,
                        "sort_order": 1,
                    },
                    {
                        "menu_id": 2,
                        "menu_nm": "Analytics",
                        "parent_menu_id": 1,
                        "sort_order": 1,
                    },
                ]
            )

            client = TestClient(app)
            response = client.get(
                "/api/users/me/menus", headers={"Authorization": f"Bearer {token}"}
            )

            assert response.status_code == 200
            data = response.json()
            assert "menu_tree" in data
            assert isinstance(data["menu_tree"], list)
