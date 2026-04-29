import pytest


@pytest.mark.asyncio
async def test_admin_menus_crud_smoke(client, db, run_id: str):
    menu_cd = f"E2E_MENU_{run_id}"
    menu_nm = f"e2e-menu-{run_id}"

    created_menu_id = None
    try:
        # create root menu
        r = await client.post(
            "/api/admin/menus",
            json={"menu_cd": menu_cd, "menu_nm": menu_nm, "parent_menu_id": None},
        )
        assert r.status_code == 201, r.text
        created_menu_id = r.json()["menu_id"]
        assert isinstance(created_menu_id, int)

        # tree includes it (flat includes)
        r = await client.get("/api/admin/menus/tree")
        assert r.status_code == 200, r.text
        data = r.json()
        flat = data.get("menus_flat") or []
        assert any(int(x["menu_id"]) == created_menu_id for x in flat)

        # patch
        r = await client.patch(
            f"/api/admin/menus/{created_menu_id}",
            json={"menu_nm": menu_nm + "-updated", "use_yn": "N"},
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        # delete (soft)
        r = await client.delete(f"/api/admin/menus/{created_menu_id}")
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True
    finally:
        if created_menu_id is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", created_menu_id)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", created_menu_id)


@pytest.mark.asyncio
async def test_get_admin_screens_list(client, db, run_id: str):
    r = await client.get("/api/admin/screens/list")
    assert r.status_code == 200, r.text
    data = r.json()
    assert "screens" in data
    assert isinstance(data["screens"], list)
    for screen in data["screens"]:
        assert "linked_menu_cnt" in screen
        assert isinstance(screen["linked_menu_cnt"], int)
        assert "linked_menus" in screen
        assert isinstance(screen["linked_menus"], list)


@pytest.mark.asyncio
async def test_create_menu_with_screen_id(client, db, run_id: str):
    scr_id = None
    try:
        r = await client.post(
            "/api/admin/screens",
            json={"scr_nm": f"test-screen-{run_id}", "template_id": 1},
        )
        assert r.status_code == 201, r.text
        scr_id = r.json()["scr_id"]

        r = await client.post(
            "/api/admin/menus",
            json={
                "menu_cd": f"SCR_MENU_{run_id}",
                "menu_nm": f"screen-menu-{run_id}",
                "screen_id": scr_id,
            },
        )
        assert r.status_code == 201, r.text
        menu_id = r.json()["menu_id"]

        row = await db.fetchrow(
            "SELECT screen_id FROM ts_menu_info WHERE menu_id = $1",
            menu_id,
        )
        assert row is not None, "ts_menu_info should exist"
        assert row["screen_id"] == scr_id, "ts_menu_info.screen_id should match created screen_id"

        await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id)
        await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id)
    finally:
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)


@pytest.mark.asyncio
async def test_delete_menu_soft_deletes_menu_and_keeps_screen(client, db, run_id: str):
    scr_id = None
    menu_id = None
    try:
        r = await client.post(
            "/api/admin/screens",
            json={"scr_nm": f"test-screen-del-{run_id}", "template_id": 1},
        )
        assert r.status_code == 201, r.text
        scr_id = r.json()["scr_id"]

        r = await client.post(
            "/api/admin/menus",
            json={
                "menu_cd": f"DEL_MENU_{run_id}",
                "menu_nm": f"del-menu-{run_id}",
                "screen_id": scr_id,
            },
        )
        assert r.status_code == 201, r.text
        menu_id = r.json()["menu_id"]

        r = await client.delete(f"/api/admin/menus/{menu_id}")
        assert r.status_code == 200, r.text

        menu_row = await db.fetchrow(
            "SELECT del_fg FROM ts_menu_info WHERE menu_id = $1",
            menu_id,
        )
        assert menu_row is not None
        assert menu_row["del_fg"] == "Y", "ts_menu_info should be soft deleted"

        screen_row = await db.fetchrow(
            "SELECT del_fg FROM ts_scr_info WHERE scr_id = $1",
            scr_id,
        )
        assert screen_row is not None
        assert screen_row["del_fg"] == "N", "ts_scr_info should remain active after menu deletion"
    finally:
        if menu_id is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id)
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)


@pytest.mark.asyncio
async def test_screen_list_shows_linked_menu_count(client, db, run_id: str):
    """4.1: 화면 생성 → 메뉴에 연동 → 화면 목록에서 연동 메뉴 수 확인"""
    scr_id = None
    menu_id = None
    try:
        r = await client.post(
            "/api/admin/screens",
            json={"scr_nm": f"test-screen-list-{run_id}", "template_id": 1},
        )
        assert r.status_code == 201, r.text
        scr_id = r.json()["scr_id"]

        r = await client.post(
            "/api/admin/menus",
            json={
                "menu_cd": f"LIST_MENU_{run_id}",
                "menu_nm": f"list-menu-{run_id}",
                "screen_id": scr_id,
            },
        )
        assert r.status_code == 201, r.text
        menu_id = r.json()["menu_id"]

        r = await client.get("/api/admin/screens/list")
        assert r.status_code == 200, r.text
        screens = r.json()["screens"]
        target = next((s for s in screens if s["scr_id"] == scr_id), None)
        assert target is not None
        assert target["linked_menu_cnt"] == 1
        assert f"list-menu-{run_id}" in target["linked_menus"]
    finally:
        if menu_id is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id)
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)


@pytest.mark.asyncio
async def test_delete_screen_soft_deletes_linked_menus(client, db, run_id: str):
    """4.2: 화면 삭제 → 연동 메뉴 함께 소프트 삭제 확인"""
    scr_id = None
    menu_id = None
    try:
        r = await client.post(
            "/api/admin/screens",
            json={"scr_nm": f"test-screen-del2-{run_id}", "template_id": 1},
        )
        assert r.status_code == 201, r.text
        scr_id = r.json()["scr_id"]

        r = await client.post(
            "/api/admin/menus",
            json={
                "menu_cd": f"DEL2_MENU_{run_id}",
                "menu_nm": f"del2-menu-{run_id}",
                "screen_id": scr_id,
            },
        )
        assert r.status_code == 201, r.text
        menu_id = r.json()["menu_id"]

        # Link a group to the menu so we can verify hard delete of ts_grp_menu
        await db.execute(
            "INSERT INTO ts_grp_menu (grp_id, menu_id, reg_dt) VALUES (1, $1, NOW())",
            menu_id,
        )

        r = await client.delete(f"/api/admin/screens/{scr_id}")
        assert r.status_code == 200, r.text

        screen_row = await db.fetchrow(
            "SELECT del_fg FROM ts_scr_info WHERE scr_id = $1", scr_id,
        )
        assert screen_row is not None
        assert screen_row["del_fg"] == "Y", "ts_scr_info should be soft deleted"

        menu_row = await db.fetchrow(
            "SELECT del_fg FROM ts_menu_info WHERE menu_id = $1", menu_id,
        )
        assert menu_row is not None
        assert menu_row["del_fg"] == "Y", "ts_menu_info should be soft deleted"

        grp_menu_row = await db.fetchrow(
            "SELECT 1 FROM ts_grp_menu WHERE menu_id = $1", menu_id,
        )
        assert grp_menu_row is None, "ts_grp_menu should be hard deleted"
    finally:
        if menu_id is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id)
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)


@pytest.mark.asyncio
async def test_multiple_menus_can_reference_same_screen(client, db, run_id: str):
    """4.4: 여러 메뉴가 동일 화면 참조 가능한지 확인"""
    scr_id = None
    menu_id_1 = None
    menu_id_2 = None
    try:
        r = await client.post(
            "/api/admin/screens",
            json={"scr_nm": f"test-screen-multi-{run_id}", "template_id": 1},
        )
        assert r.status_code == 201, r.text
        scr_id = r.json()["scr_id"]

        r = await client.post(
            "/api/admin/menus",
            json={
                "menu_cd": f"MULTI_MENU_1_{run_id}",
                "menu_nm": f"multi-menu-1-{run_id}",
                "screen_id": scr_id,
            },
        )
        assert r.status_code == 201, r.text
        menu_id_1 = r.json()["menu_id"]

        r = await client.post(
            "/api/admin/menus",
            json={
                "menu_cd": f"MULTI_MENU_2_{run_id}",
                "menu_nm": f"multi-menu-2-{run_id}",
                "screen_id": scr_id,
            },
        )
        assert r.status_code == 201, r.text
        menu_id_2 = r.json()["menu_id"]

        r = await client.get("/api/admin/screens/list")
        assert r.status_code == 200, r.text
        screens = r.json()["screens"]
        target = next((s for s in screens if s["scr_id"] == scr_id), None)
        assert target is not None
        assert target["linked_menu_cnt"] == 2
        assert f"multi-menu-1-{run_id}" in target["linked_menus"]
        assert f"multi-menu-2-{run_id}" in target["linked_menus"]
    finally:
        if menu_id_1 is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id_1)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id_1)
        if menu_id_2 is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id_2)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id_2)
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)

