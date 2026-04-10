from fastapi import APIRouter, HTTPException, Depends
from ..schemas import QueryRequest, QueryResponse
from ..services.llm import generate_sql
from ..database import fetch_df
from ..dependencies import require_auth

router = APIRouter()


@router.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest, _current_user: dict = Depends(require_auth)):
    try:
        sql, message = await generate_sql(request.question)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
        
    if not sql and message:
        return QueryResponse(data=None, sql=None, message=message)

    df = await fetch_df(sql)
    return QueryResponse(data=df.to_dict(orient="records"), sql=sql)
