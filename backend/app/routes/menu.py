from fastapi import APIRouter, Depends
from app.dependencies import require_auth
from app.services.menu import get_user_menus
from app.services.admin import get_all_menus

router = APIRouter()


@router.get("/users/me/menus")
async def get_current_user_menus(current_user: dict = Depends(require_auth)):
    user_cd = int(current_user["user_cd"])
    return await get_user_menus(user_cd)


@router.get("/menus")
async def get_menus(_: dict = Depends(require_auth)):
    menus = await get_all_menus()
    return menus
