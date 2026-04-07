"""
Deprecated: LCEL Chain 방식으로 통합됨.
이 파일은 유지보수 중이며 향후 제거 예정.
"""

from langchain_core.tools import BaseTool
from .tools import get_columns_batch, execute_sql, get_full_schema

DEFAULT_SQL_TOOLS: list[BaseTool] = [
    get_full_schema,
    get_columns_batch,
    execute_sql,
]
