from typing import Any, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, model_validator
from app.dependencies import require_sys_adm, require_auth
from app.schemas import (
    AdminGroupItem,
    ScreenTemplateItem,
    ScreenTemplateSlotItem,
    ScreenTemplateCreateRequest,
    ScreenTemplateCreateResponse,
    ScreenTemplateDeleteResponse,
)
from app.services.admin import (
    search_users,
    update_user_role,
    toggle_role_menu,
    get_all_menus,
    get_role_menu_map,
    create_menu,
    create_menu_for_screen,
    patch_menu,
    soft_delete_menu,
    move_menu,
    get_all_role_user_mappings,
    get_all_grp_info,
    get_all_user_info,
    replace_user_groups,
    replace_group_users,
    update_user_info,
    delete_user,
    reset_user_password,
    list_groups_admin,
    create_group,
    patch_group,
    soft_delete_group,
    get_all_screen_templates,
    get_screen_template_by_id,
    get_screen_template_slots,
    create_screen_template,
    delete_screen_template,
    get_template_reference_count,
    _PATCH_UNSET,
)
from app.services.screen_items import (
    create_item,
    update_item,
    get_item,
    list_items,
    delete_item,
    save_screen_slots,
    get_screen_slots,
    get_screen_with_template,
    create_screen,
    list_screens,
    delete_screen,
    patch_screen,
)
from app.services.menu import treeify

router = APIRouter()


class MenuMoveRequest(BaseModel):
    menu_id: int
    target_id: int
    position: Literal["before", "after", "inside"]


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
    menu_level: Optional[int] = Field(default=None, ge=1, le=4)
    menu_path: Optional[str] = None
    screen_id: Optional[str] = None
    sort_order: Optional[int] = None
    subtitle: Optional[str] = None

    @model_validator(mode="after")
    def validate_menu_path_for_non_slot(self):
        if self.menu_path and self.menu_path.startswith("/view/screen/"):
            if not self.screen_id:
                raise ValueError(
                    "menu_path cannot start with /view/screen/ unless screen_id is provided"
                )
        return self


class AdminMenuPatchBody(BaseModel):
    menu_cd: Optional[str] = None
    menu_nm: Optional[str] = None
    parent_menu_id: Optional[str | int] = None
    menu_level: Optional[int] = Field(default=None, ge=1, le=4)
    menu_path: Optional[str] = None
    screen_id: Optional[str] = None
    sort_order: Optional[int] = None
    use_yn: Optional[str] = None
    del_fg: Optional[str] = None
    subtitle: Optional[str] = None

    @model_validator(mode="after")
    def validate_menu_path_for_non_slot(self):
        if self.menu_path and self.menu_path.startswith("/view/screen/"):
            if not self.screen_id:
                raise ValueError(
                    "menu_path cannot start with /view/screen/ unless screen_id is provided"
                )
        return self


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
    use_yn_db = "Y" if use_yn is True else ("N" if use_yn is False else None)

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
            use_yn=use_yn_db,
            description=desc_kw,
        )
    except ValueError as e:
        if str(e) == "duplicate_grp_cd":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="이미 사용 중인 그룹코드입니다.",
            ) from e
        if str(e) == "invalid_use_yn":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid use_yn",
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
        subtitle=body.subtitle,
    )
    return {"menu_id": menu_id}


class AdminMenuCreateForScreenBody(BaseModel):
    menu_cd: str = Field(..., min_length=1)
    menu_nm: str = Field(..., min_length=1)
    screen_id: str = Field(..., min_length=1)
    sort_order: Optional[int] = None
    subtitle: Optional[str] = None


@router.post("/admin/menus/for-screen", status_code=status.HTTP_201_CREATED)
async def post_admin_menu_for_screen(
    body: AdminMenuCreateForScreenBody,
    _: dict = Depends(require_sys_adm),
):
    """
    Create a menu linked to a screen in a single transaction.
    menu_path is automatically set to /view/menu/{menu_id}.
    """
    menu_id = await create_menu_for_screen(
        menu_cd=body.menu_cd,
        menu_nm=body.menu_nm,
        screen_id=body.screen_id,
        sort_order=body.sort_order,
        subtitle=body.subtitle,
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


@router.post("/admin/menus/move")
async def move_admin_menu(
    body: MenuMoveRequest,
    _: dict = Depends(require_sys_adm),
):
    try:
        await move_menu(body.menu_id, body.target_id, body.position)
    except LookupError as e:
        key = str(e)
        if "source" in key:
            detail = "이동할 메뉴를 찾을 수 없습니다."
        else:
            detail = "대상 메뉴를 찾을 수 없습니다."
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
        ) from e
    except ValueError as e:
        msg = str(e)
        if msg == "cycle_detected":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="순환 참조가 발생합니다. 이동할 수 없습니다.",
            ) from e
        if msg in ("source_deleted", "target_deleted"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="삭제된 메뉴는 이동할 수 없습니다.",
            ) from e
        if msg == "cannot_move_to_self":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="자기 자신으로 이동할 수 없습니다.",
            ) from e
        if msg == "invalid_position":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="position은 before, after, inside 중 하나여야 합니다.",
            ) from e
        raise
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


class RoleUsersMappingsResponse(BaseModel):
    mappings: list[dict]
    groups: list[dict]
    users: list[dict]


@router.get("/admin/role-users/mappings", response_model=RoleUsersMappingsResponse)
async def get_role_user_mappings(_: dict = Depends(require_sys_adm)):
    mappings = await get_all_role_user_mappings()
    groups = await get_all_grp_info()
    users = await get_all_user_info()
    return {
        "mappings": mappings,
        "groups": groups,
        "users": users,
    }


class ReplaceGroupsRequest(BaseModel):
    grp_ids: list[int]


@router.put("/admin/users/{user_cd}/groups")
async def replace_user_groups_endpoint(
    user_cd: int,
    body: ReplaceGroupsRequest,
    _: dict = Depends(require_sys_adm),
):
    await replace_user_groups(user_cd, body.grp_ids)
    return {"ok": True}


class ReplaceUsersRequest(BaseModel):
    user_cds: list[int]


@router.put("/admin/groups/{grp_id}/users")
async def replace_group_users_endpoint(
    grp_id: int,
    body: ReplaceUsersRequest,
    _: dict = Depends(require_sys_adm),
):
    await replace_group_users(grp_id, body.user_cds)
    return {"ok": True}


class UpdateUserRequest(BaseModel):
    user_nm: Optional[str] = None
    univ_cd: Optional[str] = None
    dept_nm: Optional[str] = None
    grade_nm: Optional[str] = None
    pos_nm: Optional[str] = None
    mobile1: Optional[str] = None
    mobile2: Optional[str] = None
    mobile3: Optional[str] = None
    office1: Optional[str] = None
    office2: Optional[str] = None
    office3: Optional[str] = None
    mobile_co_cd: Optional[str] = None


@router.patch("/admin/users/{user_cd}")
async def patch_user(
    user_cd: int,
    body: UpdateUserRequest,
    _: dict = Depends(require_sys_adm),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    await update_user_info(user_cd, data)
    return {"ok": True}


@router.delete("/admin/users/{user_cd}")
async def delete_user_endpoint(
    user_cd: int,
    _: dict = Depends(require_sys_adm),
):
    await delete_user(user_cd)
    return {"ok": True}


class ResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6)


@router.post("/admin/users/{user_cd}/reset-password")
async def reset_user_password_endpoint(
    user_cd: int,
    body: ResetPasswordRequest,
    _: dict = Depends(require_sys_adm),
):
    await reset_user_password(user_cd, body.new_password)
    return {"ok": True}


@router.get("/admin/role-menu-map")
async def get_admin_role_menu_map(_: dict = Depends(require_sys_adm)):
    """
    SYS_ADM: 메뉴�별로 어떤 권한그룹(grp_id)이 매핑돼 있는지 조회.
    Response: { "menu_role_ids": { "<menu_id>": [<grp_id>, ...], ... } }
    """
    menu_role_ids = await get_role_menu_map()
    # JSON object keys must be strings; keep frontend parsing simple.
    return {"menu_role_ids": {str(k): v for k, v in menu_role_ids.items()}}


@router.get("/admin/screen-templates", response_model=list[ScreenTemplateItem])
async def get_admin_screen_templates(
    is_default: Optional[str] = None,
    _: dict = Depends(require_sys_adm),
):
    rows = await get_all_screen_templates(is_default)
    return [ScreenTemplateItem(**r) for r in rows]


@router.post("/admin/screen-templates", status_code=status.HTTP_201_CREATED, response_model=ScreenTemplateCreateResponse)
async def post_admin_screen_template(
    body: ScreenTemplateCreateRequest,
    _: dict = Depends(require_sys_adm),
):
    if not body.name or not body.name.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="템플릿 이름을 입력해주세요",
        )
    if not body.slots or len(body.slots) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="최소 하나 이상의 슬롯을 생성해주세요",
        )
    template_id = await create_screen_template(body.name, body.slots)
    return {"template_id": template_id, "name": body.name, "slots": body.slots}


class TemplateReferenceCountResponse(BaseModel):
    template_id: int
    reference_count: int


@router.get("/admin/screen-templates/{template_id}/reference-count", response_model=TemplateReferenceCountResponse)
async def get_template_reference_count_endpoint(
    template_id: int,
    _: dict = Depends(require_sys_adm),
):
    count = await get_template_reference_count(template_id)
    return {"template_id": template_id, "reference_count": count}


@router.delete("/admin/screen-templates/{template_id}", response_model=ScreenTemplateDeleteResponse)
async def delete_admin_screen_template(
    template_id: int,
    _: dict = Depends(require_sys_adm),
):
    try:
        await delete_screen_template(template_id)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )
    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="기본 템플릿은 삭제할 수 없습니다",
        )
    except ValueError as e:
        msg = str(e)
        if msg.startswith("referenced_by_screens:"):
            cnt = msg.split(":", 1)[1]
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"이 템플릿을 사용하는 화면 {cnt}개가 있습니다. 먼저 삭제해주세요.",
            ) from e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg,
        ) from e
    return {"ok": True}


@router.get("/admin/screen-templates/{template_id}", response_model=ScreenTemplateItem)
async def get_admin_screen_template(
    template_id: int,
    _: dict = Depends(require_sys_adm),
):
    row = await get_screen_template_by_id(template_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template not found",
        )
    return ScreenTemplateItem(**row)


@router.get("/admin/screen-templates/{template_id}/slots", response_model=list[ScreenTemplateSlotItem])
async def get_admin_screen_template_slots(
    template_id: int,
    _: dict = Depends(require_sys_adm),
):
    rows = await get_screen_template_slots(template_id)
    return [ScreenTemplateSlotItem(**r) for r in rows]


# ── Screen Item Management ──

class ItemCreateBody(BaseModel):
    item_nm: str = Field(..., min_length=1)
    shape_cnts_id: Optional[int] = None
    sql_cnts_id: Optional[int] = None
    mapping_json: Optional[dict[str, Any]] = None


class ItemPatchBody(BaseModel):
    item_nm: Optional[str] = None
    shape_cnts_id: Optional[int] = None
    sql_cnts_id: Optional[int] = None
    mapping_json: Optional[dict[str, Any]] = None


class ScreenSlotBody(BaseModel):
    slot_id: str
    item_id: Optional[int] = None


@router.post("/admin/items", status_code=status.HTTP_201_CREATED)
async def post_item(
    body: ItemCreateBody,
    _: dict = Depends(require_sys_adm),
):
    try:
        item_id = await create_item(
            item_nm=body.item_nm,
            shape_cnts_id=body.shape_cnts_id,
            sql_cnts_id=body.sql_cnts_id,
            mapping_json=body.mapping_json,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    return {"item_id": item_id}


@router.get("/admin/items")
async def get_items(_: dict = Depends(require_sys_adm)):
    rows = await list_items()
    return {"items": rows}


@router.get("/admin/items/{item_id}")
async def get_item_detail(item_id: int, _: dict = Depends(require_sys_adm)):
    row = await get_item(item_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return {"item": row}


@router.patch("/admin/items/{item_id}")
async def patch_item(
    item_id: int,
    body: ItemPatchBody,
    _: dict = Depends(require_sys_adm),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    try:
        await update_item(
            item_id,
            item_nm=data.get("item_nm"),
            shape_cnts_id=data.get("shape_cnts_id"),
            sql_cnts_id=data.get("sql_cnts_id"),
            mapping_json=data.get("mapping_json"),
        )
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return {"ok": True}


@router.delete("/admin/items/{item_id}")
async def delete_item_endpoint(item_id: int, _: dict = Depends(require_sys_adm)):
    try:
        await delete_item(item_id)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )
    return {"ok": True}


# ── Screen Slot Management ──

@router.put("/admin/screens/{scr_id}/slots")
async def put_screen_slots(
    scr_id: str,
    body: list[ScreenSlotBody],
    _: dict = Depends(require_sys_adm),
):
    slots = [{"slot_id": s.slot_id, "item_id": s.item_id} for s in body]
    await save_screen_slots(scr_id, slots)
    return {"ok": True}


@router.get("/admin/screens/list")
async def get_admin_screens_list(_: dict = Depends(require_sys_adm)):
    rows = await list_screens()
    return {"screens": rows}


@router.delete("/admin/screens/{scr_id}")
async def delete_admin_screen(
    scr_id: str,
    _: dict = Depends(require_sys_adm),
):
    try:
        await delete_screen(scr_id)
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screen not found",
        )
    return {"ok": True}


class ScreenPatchBody(BaseModel):
    scr_nm: Optional[str] = None


@router.patch("/admin/screens/{scr_id}")
async def patch_admin_screen(
    scr_id: str,
    body: ScreenPatchBody,
    _: dict = Depends(require_sys_adm),
):
    data = body.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update",
        )
    try:
        await patch_screen(scr_id, scr_nm=data.get("scr_nm"))
    except LookupError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screen not found",
        )
    return {"ok": True}


@router.get("/admin/screens/{scr_id}/slots")
async def get_screen_slots_endpoint(scr_id: str, _: dict = Depends(require_sys_adm)):
    rows = await get_screen_slots(scr_id)
    return {"slots": rows}


@router.get("/admin/screens/{scr_id}")
async def get_screen_endpoint(scr_id: str, _: dict = Depends(require_sys_adm)):
    row = await get_screen_with_template(scr_id)
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screen not found",
        )
    return {"screen": row}


class ScreenCreateBody(BaseModel):
    scr_nm: str = Field(..., min_length=1)
    template_id: int


@router.post("/admin/screens", status_code=status.HTTP_201_CREATED)
async def post_screen(
    body: ScreenCreateBody,
    _: dict = Depends(require_sys_adm),
):
    try:
        scr_id = await create_screen(scr_nm=body.scr_nm, template_id=body.template_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    return {"scr_id": scr_id}
