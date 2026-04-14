from fastapi import APIRouter, HTTPException, Depends
from ..schemas import QueryRequest, QueryResponse, ChartConfig
from ..services.llm import generate_sql
from ..database import fetch_df
from ..dependencies import require_auth

router = APIRouter()


@router.post("/api/query")
async def query(request: QueryRequest, _current_user: dict = Depends(require_auth)):
    try:
        sql, message, chart_config_raw = await generate_sql(request.question)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
        
    if not sql and message:
        return QueryResponse(data=None, sql=None, message=message)

    # Build ChartConfig if the LLM returned a valid config
    chart_config = None
    if chart_config_raw and isinstance(chart_config_raw, dict) and "type" in chart_config_raw:
        try:
            chart_config = ChartConfig(**chart_config_raw)
        except Exception:
            chart_config = None

    df = await fetch_df(sql)
    return QueryResponse(data=df.to_dict(orient="records"), sql=sql, chart_config=chart_config)
