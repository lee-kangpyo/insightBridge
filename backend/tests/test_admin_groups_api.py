import pytest


@pytest.mark.asyncio
async def test_admin_groups_crud_smoke(client, db, run_id: str):
    grp_cd = f"E2E_GRP_{run_id}"
    grp_nm = f"e2e-group-{run_id}"

    created_grp_id = None
    try:
        # create
        r = await client.post(
            "/api/admin/groups",
            json={"grp_cd": grp_cd, "grp_nm": grp_nm, "description": "e2e"},
        )
        assert r.status_code == 201, r.text
        created_grp_id = r.json()["grp_id"]
        assert isinstance(created_grp_id, int)

        # list
        r = await client.get("/api/admin/groups")
        assert r.status_code == 200, r.text
        rows = r.json()
        assert isinstance(rows, list)
        assert any(int(x["grp_id"]) == created_grp_id for x in rows)

        # patch (use_yn false -> 'N')
        r = await client.patch(
            f"/api/admin/groups/{created_grp_id}",
            json={"grp_nm": grp_nm + "-updated", "use_yn": False, "description": ""},
        )
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        # delete (soft)
        r = await client.delete(f"/api/admin/groups/{created_grp_id}")
        assert r.status_code == 200, r.text
        assert r.json().get("ok") is True

        # list again: soft-deleted rows should be hidden
        r = await client.get("/api/admin/groups")
        assert r.status_code == 200, r.text
        rows = r.json()
        assert isinstance(rows, list)
        assert not any(int(x["grp_id"]) == created_grp_id for x in rows)
    finally:
        # Hard cleanup to keep DB tidy (only rows we created)
        if created_grp_id is not None:
            await db.execute("DELETE FROM ts_grp_user WHERE grp_id = $1", created_grp_id)
            await db.execute("DELETE FROM ts_grp_menu WHERE grp_id = $1", created_grp_id)
            await db.execute("DELETE FROM ts_grp_info WHERE grp_id = $1", created_grp_id)

