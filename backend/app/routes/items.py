from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import require_auth
from app.services.item_renderer import render_item

router = APIRouter()


@router.get("/items/{item_id}/render")
async def get_item_render(item_id: int, _: dict = Depends(require_auth)):
    """
    인증된 사용자가 아이템 렌더링 결과를 조회합니다.
    남겨진 정보는 렌더링에 필요한 최소 정볧만 포함합니다.
    """
    try:
        result = await render_item(item_id)
        return result
    except LookupError as e:
        if str(e) == "item_not_found":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Render failed: {str(e)}",
        )
