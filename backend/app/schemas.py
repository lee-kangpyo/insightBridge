from pydantic import BaseModel
from typing import Any


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    data: list[dict[str, Any]]
    sql: str
