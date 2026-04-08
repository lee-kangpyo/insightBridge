from pydantic import BaseModel
from typing import Any, Optional


class QueryRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    data: Optional[list[dict[str, Any]]] = None
    sql: Optional[str] = None
    message: Optional[str] = None
