import json

import asyncpg
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from ..schemas import QueryOnceRequest, QueryRequest, RefineRequest
from ..services.llm import generate_sql, generate_sql_multi
from ..dependencies import require_auth
from ..database import fetch_df

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


@router.post("/api/query/admin")
async def query_admin(request: QueryRequest, _current_user: dict = Depends(require_auth)):
    """
    Admin/Contents 전용 SSE.
    - 멀티 후보(방법 1/2/3) 없이 1개 후보만 생성/실행한 뒤,
      candidate 1회 + done 1회를 스트리밍한다.
    - 기존 /api/query(SSE 멀티 후보)에는 영향 주지 않는다.
    """

    async def event_stream():
        try:
            sql, message, chart_config = await generate_sql(request.question)
            if message and not sql:
                payload = {"error": message}
                yield f"event: error\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
                return
            if not sql:
                payload = {"error": "SQL 생성에 실패했습니다."}
                yield f"event: error\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
                return

            df = await fetch_df(sql)
            df = df.head(20)
            data = df.where(df.notnull(), None).to_dict(orient="records")
            evaluation = f"SQL 실행 결과: {len(df)} 행\n" + df.head(5).to_string(index=False)

            cand_payload = {
                "index": 0,
                "sql": sql,
                "data": data,
                "chart_config": chart_config,
                "evaluation": evaluation,
            }
            yield f"event: candidate\ndata: {json.dumps(cand_payload, ensure_ascii=False, default=str)}\n\n"

            done_payload = {"best_index": 0, "reason": "admin single-candidate"}
            yield f"event: done\ndata: {json.dumps(done_payload, ensure_ascii=False)}\n\n"
        except asyncpg.PostgresError as e:
            payload = {"error": f"SQL 실행 오류: {type(e).__name__}: {e}"}
            yield f"event: error\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
        except Exception as e:
            payload = {"error": str(e)}
            yield f"event: error\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"

    headers = {
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
    }

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers=headers,
    )


@router.post("/api/query/once")
async def query_once(
    request: QueryOnceRequest, _current_user: dict = Depends(require_auth)
):
    """
    단일 SQL 생성 + 단일 DB 실행(미리보기) 전용 엔드포인트.
    - /admin/contents의 SQL 설정에서 "한 번만 실행"이 필요할 때 사용한다.
    - /api/query(SSE)는 멀티 후보/리파인 UX용으로 유지한다.
    """
    limit = int(request.limit or 20)
    if limit < 1:
        limit = 1
    if limit > 200:
        limit = 200

    sql, message, chart_config = await generate_sql(request.question)
    if message and not sql:
        raise HTTPException(status_code=400, detail=message)
    if not sql:
        raise HTTPException(status_code=500, detail="SQL 생성에 실패했습니다.")

    try:
        df = await fetch_df(sql)
        df = df.head(limit) if limit else df
        data = df.where(df.notnull(), None).to_dict(orient="records")
    except asyncpg.PostgresError as e:
        # LLM이 생성한 SQL이 스키마/권한과 불일치할 수 있어 400으로 내려준다.
        raise HTTPException(
            status_code=400,
            detail=f"SQL 실행 오류: {type(e).__name__}: {e}",
        ) from e

    return {
        "sql": sql,
        "data": data,
        "chart_config": chart_config,
        "rows": len(data),
    }


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
