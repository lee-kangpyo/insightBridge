from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.dependencies import require_auth
from app.services.menu import (
    verify_menu_access,
    verify_screen_access,
    MenuNotFoundError,
    MenuDeletedError,
    MenuInactiveError,
    MenuAccessDeniedError,
)
from app.services.screen_items import (
    get_screen_with_template,
    get_screen_slots,
    screen_has_year_placeholder,
)
from app.services.admin import get_screen_template_slots

router = APIRouter()


class ViewerMenuResponse(BaseModel):
    screen_id: str
    title: str
    subtitle: Optional[str] = None
    scr_nm: Optional[str] = None
    year_dependent: bool = False


class ViewerScreenResponse(BaseModel):
    scr_id: str
    scr_nm: Optional[str] = None
    template_id: Optional[int] = None
    template_slots: list[dict]
    assigned_slots: list[dict]


@router.get("/viewer/menus/{menu_id}", response_model=ViewerMenuResponse)
async def get_viewer_menu(
    menu_id: int,
    current_user: dict = Depends(require_auth),
):
    """
    Authenticated users: get screen info for a menu they have access to.
    Unified menu guard checks menu status and user permission.
    Returns 400 if the menu is not associated with a screen.
    """
    user_cd = int(current_user["user_cd"])

    try:
        menu = await verify_menu_access(menu_id, user_cd)
    except MenuNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Menu not found",
        )
    except MenuDeletedError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Deleted menu",
        )
    except MenuInactiveError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive menu",
        )
    except MenuAccessDeniedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    screen_id = menu.get("screen_id")
    if not screen_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This menu is not associated with a screen",
        )

    screen = await get_screen_with_template(screen_id)
    scr_nm = screen.get("scr_nm") if screen else None

    year_dependent = await screen_has_year_placeholder(screen_id)

    return ViewerMenuResponse(
        screen_id=screen_id,
        title=menu.get("menu_nm") or "",
        subtitle=menu.get("subtitle"),
        scr_nm=scr_nm,
        year_dependent=year_dependent,
    )


@router.get("/viewer/screens/{screen_id}", response_model=ViewerScreenResponse)
async def get_viewer_screen(
    screen_id: str,
    current_user: dict = Depends(require_auth),
):
    """
    Authenticated users: get screen composition (template + slots + items).
    Reverse look-up security: user must have access to at least one menu
    linked to this screen.
    """
    user_cd = int(current_user["user_cd"])

    try:
        await verify_screen_access(screen_id, user_cd)
    except MenuAccessDeniedError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    screen = await get_screen_with_template(screen_id)
    if not screen:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screen not found",
        )

    template_id = screen.get("template_id")
    template_slots = []
    if template_id:
        template_slots = await get_screen_template_slots(template_id)

    assigned_slots = await get_screen_slots(screen_id)

    return ViewerScreenResponse(
        scr_id=screen_id,
        scr_nm=screen.get("scr_nm"),
        template_id=template_id,
        template_slots=template_slots,
        assigned_slots=assigned_slots,
    )
