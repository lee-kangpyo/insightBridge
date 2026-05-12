import pytest
import sys
import os
from unittest.mock import AsyncMock, patch, MagicMock
from collections import OrderedDict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _make_row(**kwargs):
    defaults = {
        "menu_id": 1,
        "parent_menu_id": None,
        "sort_order": 1,
        "menu_level": 1,
        "del_fg": "N",
    }
    defaults.update(kwargs)
    return OrderedDict(defaults)


def _mock_pool(conn_mock):
    pool_mock = MagicMock()
    pool_mock.acquire.return_value.__aenter__.return_value = conn_mock
    return pool_mock


def _mock_tx(conn_mock):
    tx_cm = AsyncMock()
    tx_cm.__aenter__.return_value = None
    tx_cm.__aexit__.return_value = None
    conn_mock.transaction = MagicMock(return_value=tx_cm)


class TestMoveMenuValidation:
    @pytest.mark.asyncio
    async def test_invalid_position_raises(self):
        from app.services.admin import move_menu

        pool_mock = MagicMock()
        with patch("app.services.admin.get_pool", return_value=pool_mock):
            with pytest.raises(ValueError, match="invalid_position"):
                await move_menu(1, 2, "invalid")

    @pytest.mark.asyncio
    async def test_source_not_found(self):
        from app.services.admin import move_menu

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            None,
            _make_row(menu_id=2),
        ])
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(LookupError, match="source_not_found"):
                await move_menu(999, 2, "before")

    @pytest.mark.asyncio
    async def test_source_deleted(self):
        from app.services.admin import move_menu

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            _make_row(menu_id=1, del_fg="Y"),
            _make_row(menu_id=2),
        ])
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(ValueError, match="source_deleted"):
                await move_menu(1, 2, "before")

    @pytest.mark.asyncio
    async def test_target_not_found(self):
        from app.services.admin import move_menu

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            _make_row(menu_id=1),
            None,
        ])
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(LookupError, match="target_not_found"):
                await move_menu(1, 999, "before")

    @pytest.mark.asyncio
    async def test_target_deleted(self):
        from app.services.admin import move_menu

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            _make_row(menu_id=1),
            _make_row(menu_id=2, del_fg="Y"),
        ])
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(ValueError, match="target_deleted"):
                await move_menu(1, 2, "before")

    @pytest.mark.asyncio
    async def test_cannot_move_to_self(self):
        from app.services.admin import move_menu

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            _make_row(menu_id=1),
            _make_row(menu_id=1),
        ])
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(ValueError, match="cannot_move_to_self"):
                await move_menu(1, 1, "before")


class TestMoveMenuCycleDetection:
    @pytest.mark.asyncio
    async def test_cycle_detected_direct_child(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id="2")
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=1, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            source, target,
            OrderedDict({"max_so": 0}),
            OrderedDict({"found": 1}),
        ])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(ValueError, match="cycle_detected"):
                await move_menu(1, 2, "inside")

    @pytest.mark.asyncio
    async def test_cycle_detected_before_position(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id="3", sort_order=1, menu_level=2)
        target = _make_row(menu_id=2, parent_menu_id="1", sort_order=1, menu_level=2)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            source, target,
            OrderedDict({"found": 1}),
        ])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            with pytest.raises(ValueError, match="cycle_detected"):
                await move_menu(1, 2, "before")

    @pytest.mark.asyncio
    async def test_no_cycle_allows_move(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=2, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            source, target, None,
        ])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "after")
            assert conn_mock.execute.call_count >= 4


class TestMoveMenuPositions:
    @pytest.mark.asyncio
    async def test_move_before_sets_correct_sort_order(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=2, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[source, target, None])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "before")
            calls = conn_mock.execute.call_args_list
            move_calls = [c for c in calls if "SET parent_menu_id" in c[0][0]]
            assert len(move_calls) == 1
            assert move_calls[0][0][2] == 1  # same-parent adjustment: 2 -> 1

    @pytest.mark.asyncio
    async def test_move_after_sets_correct_sort_order(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=2, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[source, target, None])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "after")
            calls = conn_mock.execute.call_args_list
            move_calls = [c for c in calls if "SET parent_menu_id" in c[0][0]]
            assert len(move_calls) == 1
            assert move_calls[0][0][2] == 2  # same-parent adjustment: 3 -> 2

    @pytest.mark.asyncio
    async def test_move_inside_sets_parent_to_target(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=2, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            source, target,
            OrderedDict({"max_so": 0}),
            None,
        ])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "inside")
            calls = conn_mock.execute.call_args_list
            move_calls = [c for c in calls if "SET parent_menu_id" in c[0][0]]
            assert len(move_calls) == 1
            assert move_calls[0][0][1] == "2"  # new_parent_id = str(target_id)
            assert move_calls[0][0][3] == 2    # new_level = target.level + 1

    @pytest.mark.asyncio
    async def test_move_inside_appends_after_existing_children(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=2, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[
            source, target,
            OrderedDict({"max_so": 5}),
            None,
        ])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "inside")
            calls = conn_mock.execute.call_args_list
            move_calls = [c for c in calls if "SET parent_menu_id" in c[0][0]]
            assert move_calls[0][0][2] == 6  # max_so + 1


class TestMoveMenuSortOrderCompaction:
    @pytest.mark.asyncio
    async def test_old_siblings_compacted_when_parent_set(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id="10", sort_order=2, menu_level=2)
        target = _make_row(menu_id=5, parent_menu_id=None, sort_order=1, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[source, target, None])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 5, "after")
            calls = conn_mock.execute.call_args_list
            compact_calls = [c for c in calls if "sort_order - 1" in c[0][0] and "parent_menu_id = $1" in c[0][0]]
            assert len(compact_calls) == 1

    @pytest.mark.asyncio
    async def test_old_siblings_compacted_when_root(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id="10", sort_order=1, menu_level=2)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[source, target, None])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "before")
            calls = conn_mock.execute.call_args_list
            compact_calls = [c for c in calls if "sort_order - 1" in c[0][0] and "IS NULL" in c[0][0]]
            assert len(compact_calls) == 1


class TestMoveMenuDescendantLevelRecalculation:
    @pytest.mark.asyncio
    async def test_descendant_levels_updated(self):
        from app.services.admin import move_menu

        source = _make_row(menu_id=1, parent_menu_id=None, sort_order=1, menu_level=1)
        target = _make_row(menu_id=2, parent_menu_id=None, sort_order=2, menu_level=1)

        conn_mock = AsyncMock()
        conn_mock.fetchrow = AsyncMock(side_effect=[source, target, None])
        conn_mock.execute = AsyncMock()
        _mock_tx(conn_mock)

        with patch("app.services.admin.get_pool", return_value=_mock_pool(conn_mock)):
            await move_menu(1, 2, "after")
            calls = conn_mock.execute.call_args_list
            level_calls = [c for c in calls if "desc_tree" in c[0][0]]
            assert len(level_calls) == 1


def _make_route_client():
    from fastapi.testclient import TestClient
    from app.main import app
    from app.services.auth import create_access_token

    client = TestClient(app)
    token = create_access_token(
        data={"sub": "1", "univ_nm": "Test Univ", "roles": ["SYS_ADM"]}
    )
    return client, token


class TestMoveMenuRoute:
    @pytest.mark.asyncio
    async def test_move_route_requires_sys_adm(self):
        from fastapi.testclient import TestClient
        from app.main import app
        from app.services.auth import create_access_token

        client = TestClient(app)
        token = create_access_token(
            data={"sub": "1", "univ_nm": "Test Univ", "roles": ["EMP"]}
        )
        response = client.post(
            "/api/admin/menus/move",
            json={"menu_id": 1, "target_id": 2, "position": "before"},
            headers={"Authorization": f"Bearer {token}", "Origin": "http://testserver"},
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_move_route_success(self):
        client, token = _make_route_client()

        with patch("app.routes.admin.move_menu", new_callable=AsyncMock) as mock_move:
            mock_move.return_value = None
            response = client.post(
                "/api/admin/menus/move",
                json={"menu_id": 1, "target_id": 2, "position": "before"},
                headers={"Authorization": f"Bearer {token}", "Origin": "http://testserver"},
            )
        assert response.status_code == 200
        assert response.json()["ok"] is True

    @pytest.mark.asyncio
    async def test_move_route_cycle_returns_409(self):
        client, token = _make_route_client()

        with patch("app.routes.admin.move_menu", new_callable=AsyncMock) as mock_move:
            mock_move.side_effect = ValueError("cycle_detected")
            response = client.post(
                "/api/admin/menus/move",
                json={"menu_id": 1, "target_id": 2, "position": "inside"},
                headers={"Authorization": f"Bearer {token}", "Origin": "http://testserver"},
            )
        assert response.status_code == 409
        assert "순환" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_move_route_not_found_returns_404(self):
        client, token = _make_route_client()

        with patch("app.routes.admin.move_menu", new_callable=AsyncMock) as mock_move:
            mock_move.side_effect = LookupError("source_not_found")
            response = client.post(
                "/api/admin/menus/move",
                json={"menu_id": 999, "target_id": 2, "position": "before"},
                headers={"Authorization": f"Bearer {token}", "Origin": "http://testserver"},
            )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_move_route_deleted_returns_400(self):
        client, token = _make_route_client()

        with patch("app.routes.admin.move_menu", new_callable=AsyncMock) as mock_move:
            mock_move.side_effect = ValueError("target_deleted")
            response = client.post(
                "/api/admin/menus/move",
                json={"menu_id": 1, "target_id": 2, "position": "before"},
                headers={"Authorization": f"Bearer {token}", "Origin": "http://testserver"},
            )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_move_route_self_returns_400(self):
        client, token = _make_route_client()

        with patch("app.routes.admin.move_menu", new_callable=AsyncMock) as mock_move:
            mock_move.side_effect = ValueError("cannot_move_to_self")
            response = client.post(
                "/api/admin/menus/move",
                json={"menu_id": 1, "target_id": 1, "position": "before"},
                headers={"Authorization": f"Bearer {token}", "Origin": "http://testserver"},
            )
        assert response.status_code == 400
