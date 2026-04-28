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


@pytest.mark.asyncio
async def test_create_menu_with_screen_id_sets_reverse_reference(client, db, run_id: str):
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
            "SELECT menu_id FROM ts_scr_info WHERE scr_id = $1",
            scr_id,
        )
        assert row is not None, "ts_scr_info should have menu_id set"
        assert int(row["menu_id"]) == menu_id, "ts_scr_info.menu_id should match created menu_id"

        await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id)
        await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id)
    finally:
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)


@pytest.mark.asyncio
async def test_delete_menu_clears_screen_menu_id(client, db, run_id: str):
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

        row = await db.fetchrow(
            "SELECT menu_id FROM ts_scr_info WHERE scr_id = $1",
            scr_id,
        )
        assert row is not None and row["menu_id"] is not None

        r = await client.delete(f"/api/admin/menus/{menu_id}")
        assert r.status_code == 200, r.text

        row = await db.fetchrow(
            "SELECT menu_id FROM ts_scr_info WHERE scr_id = $1",
            scr_id,
        )
        assert row["menu_id"] is None, "ts_scr_info.menu_id should be NULL after menu deletion"
    finally:
        if menu_id is not None:
            await db.execute("DELETE FROM ts_grp_menu WHERE menu_id = $1", menu_id)
            await db.execute("DELETE FROM ts_menu_info WHERE menu_id = $1", menu_id)
        if scr_id is not None:
            await db.execute("DELETE FROM ts_scr_info WHERE scr_id = $1", scr_id)

