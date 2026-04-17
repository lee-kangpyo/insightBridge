from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.dependencies import require_sys_adm
from app.services.admin import search_users, update_user_role, toggle_role_menu

router = APIRouter()


class UpdateRoleRequest(BaseModel):
    grp_id: int


class ToggleRoleMenuRequest(BaseModel):
    menu_id: int
    role_id: int
    enabled: bool


@router.get("/admin/users")
async def get_users(search: str = "", _: dict = Depends(require_sys_adm)):
    users = await search_users(search)
    return {"users": users}


@router.patch("/admin/users/{user_cd}/role")
async def patch_user_role(
    user_cd: int,
    body: UpdateRoleRequest,
    _: dict = Depends(require_sys_adm),
):
    await update_user_role(user_cd, body.grp_id)
    return {"ok": True}


@router.patch("/admin/role-menu")
async def patch_role_menu(
    body: ToggleRoleMenuRequest,
    _: dict = Depends(require_sys_adm),
):
    await toggle_role_menu(body.menu_id, body.role_id, body.enabled)
    return {"ok": True}
