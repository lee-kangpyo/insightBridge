from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.dependencies import require_sys_adm
from app.services.admin import (
    search_users,
    update_user_role,
    toggle_role_menu,
    get_all_menus,
    create_menu,
    patch_menu,
    soft_delete_menu,
)
from app.services.menu import treeify

router = APIRouter()


class UpdateRoleRequest(BaseModel):
    grp_id: int


class ToggleRoleMenuRequest(BaseModel):
    menu_id: int
    role_id: int
    enabled: bool


class AdminMenuCreateBody(BaseModel):
    menu_cd: str = Field(..., min_length=1)
    menu_nm: str = Field(..., min_length=1)
    parent_menu_id: Optional[str | int] = None
    menu_level: Optional[int] = None
    menu_path: Optional[str] = None
    screen_id: Optional[str] = None
    sort_order: Optional[int] = None


class AdminMenuPatchBody(BaseModel):
    menu_cd: Optional[str] = None
    menu_nm: Optional[str] = None
    parent_menu_id: Optional[str | int] = None
    menu_level: Optional[int] = None
    menu_path: Optional[str] = None
    screen_id: Optional[str] = None
    sort_order: Optional[int] = None
    del_fg: Optional[str] = None


@router.get("/admin/menus/tree")
async def get_admin_menu_tree(_: dict = Depends(require_sys_adm)):
    flat = await get_all_menus(include_deleted=False)
    return {"menu_tree": treeify(flat), "menus_flat": flat}


@router.post("/admin/menus", status_code=status.HTTP_201_CREATED)
async def post_admin_menu(
    body: AdminMenuCreateBody,
    _: dict = Depends(require_sys_adm),
):
    menu_id = await create_menu(
        menu_cd=body.menu_cd,
        menu_nm=body.menu_nm,
        parent_menu_id=body.parent_menu_id,
        menu_level=body.menu_level,
        menu_path=body.menu_path,
        screen_id=body.screen_id,
        sort_order=body.sort_order,
    )
    return {"menu_id": menu_id}


@router.patch("/admin/menus/{menu_id}")
async def patch_admin_menu(
    menu_id: int,
    body: AdminMenuPatchBody,
    _: dict = Depends(require_sys_adm),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    await patch_menu(menu_id, data)
    return {"ok": True}


@router.delete("/admin/menus/{menu_id}")
async def delete_admin_menu(
    menu_id: int,
    _: dict = Depends(require_sys_adm),
):
    await soft_delete_menu(menu_id)
    return {"ok": True}


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
