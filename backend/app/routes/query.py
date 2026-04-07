from fastapi import APIRouter, HTTPException
from ..schemas import QueryRequest, QueryResponse
from ..services.llm import generate_sql
from ..database import fetch_df

router = APIRouter()


@router.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        sql = await generate_sql(request.question)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    df = await fetch_df(sql)
    return QueryResponse(data=df.to_dict(orient="records"), sql=sql)
