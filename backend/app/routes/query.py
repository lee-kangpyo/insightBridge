import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from ..schemas import QueryRequest, RefineRequest
from ..services.llm import generate_sql_multi
from ..dependencies import require_auth

router = APIRouter()


@router.post("/api/query")
async def query(request: QueryRequest, _current_user: dict = Depends(require_auth)):
    async def event_stream():
        try:
            async for event_type, payload in generate_sql_multi(request.question):
                data = json.dumps(payload, ensure_ascii=False, default=str)
                yield f"event: {event_type}\ndata: {data}\n\n"
        except Exception as e:
            error_payload = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"event: error\ndata: {error_payload}\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    }

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers=headers,
    )


@router.post("/api/query/refine")
async def query_refine(
    request: RefineRequest, _current_user: dict = Depends(require_auth)
):
    combined_question = f"{request.original_question}\n\n[추가 요청]: {request.feedback}"

    if request.previous_candidates:
        prev_context = "\n".join(
            [
                f"- 이전 시도 {i+1}: {c.get('sql', '')[:100]}... (평가: {c.get('evaluation', '')[:100]}...)"
                for i, c in enumerate(request.previous_candidates)
            ]
        )
        combined_question = f"{combined_question}\n\n[이전 시도 결과]:\n{prev_context}"

    async def event_stream():
        try:
            async for event_type, payload in generate_sql_multi(combined_question):
                data = json.dumps(payload, ensure_ascii=False, default=str)
                yield f"event: {event_type}\ndata: {data}\n\n"
        except Exception as e:
            error_payload = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"event: error\ndata: {error_payload}\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    }

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers=headers,
    )
