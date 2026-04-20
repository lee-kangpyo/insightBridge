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

