from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from app.dependencies import require_sys_adm
from app.schemas import AdminGroupItem
from app.services.admin import (
    search_users,
    update_user_role,
    toggle_role_menu,
    get_all_menus,
    create_menu,
    patch_menu,
    soft_delete_menu,
    list_groups_admin,
    create_group,
    patch_group,
    soft_delete_group,
    _PATCH_UNSET,
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
    use_yn: Optional[str] = None
    del_fg: Optional[str] = None


class AdminGroupCreateBody(BaseModel):
    grp_cd: str = Field(..., min_length=1)
    grp_nm: str = Field(..., min_length=1)
    description: Optional[str] = None


class AdminGroupPatchBody(BaseModel):
    grp_cd: Optional[str] = None
    grp_nm: Optional[str] = None
    description: Optional[str] = None
    use_yn: Optional[bool] = None


@router.get("/admin/groups", response_model=list[AdminGroupItem])
async def get_admin_groups(_: dict = Depends(require_sys_adm)):
    rows = await list_groups_admin()
    return [AdminGroupItem(**r) for r in rows]


@router.post("/admin/groups", status_code=status.HTTP_201_CREATED)
async def post_admin_group(
    body: AdminGroupCreateBody,
    _: dict = Depends(require_sys_adm),
):
    try:
        grp_id = await create_group(body.grp_cd, body.grp_nm, body.description)
    except ValueError as e:
        if str(e) == "duplicate_grp_cd":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="이미 사용 중인 그룹코드입니다.",
            ) from e
        raise
    return {"grp_id": grp_id}


@router.patch("/admin/groups/{grp_id}")
async def patch_admin_group(
    grp_id: int,
    body: AdminGroupPatchBody,
    _: dict = Depends(require_sys_adm),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    use_yn = data.pop("use_yn", None)
    del_fg = "N" if use_yn is True else ("Y" if use_yn is False else None)

    desc_kw: Any = _PATCH_UNSET
    if "description" in data:
        raw = data.pop("description")
        if raw is None or (isinstance(raw, str) and not str(raw).strip()):
            desc_kw = None
        else:
            desc_kw = str(raw).strip()

    try:
        await patch_group(
            grp_id,
            grp_cd=data.get("grp_cd"),
            grp_nm=data.get("grp_nm"),
            del_fg=del_fg,
            description=desc_kw,
        )
    except ValueError as e:
        if str(e) == "duplicate_grp_cd":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="이미 사용 중인 그룹코드입니다.",
            ) from e
        if str(e) == "invalid_del_fg":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid del_fg",
            ) from e
        raise
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    return {"ok": True}


@router.delete("/admin/groups/{grp_id}")
async def delete_admin_group(
    grp_id: int,
    _: dict = Depends(require_sys_adm),
):
    try:
        await soft_delete_group(grp_id)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found",
        )
    return {"ok": True}


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
    try:
        await patch_menu(menu_id, data)
    except ValueError as e:
        if str(e) == "invalid_use_yn":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid use_yn",
            ) from e
        raise
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
