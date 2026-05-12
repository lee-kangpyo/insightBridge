from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.dependencies import require_auth
from app.services.item_renderer import render_item

router = APIRouter()


@router.get("/items/{item_id}/render")
async def get_item_render(
    item_id: int,
    request: Request,
    _: dict = Depends(require_auth),
):
    """
    인증된 사용자가 아이템 렌더링 결과를 조회합니다.
    ctx 파라미터로 base_year 등의 컨텍스트를 전달할 수 있습니다.
    예: ?ctx[base_year]=2025
    """
    ctx = None
    ctx_prefix = "ctx["
    for key, value in request.query_params.items():
        if key.startswith(ctx_prefix) and key.endswith("]"):
            field = key[len(ctx_prefix):-1]
            if ctx is None:
                ctx = {}
            ctx[field] = value

    try:
        result = await render_item(item_id, ctx=ctx)
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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Render failed: {str(e)}",
        )
