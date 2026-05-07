"""
Admin SQL preview: PostgreSQL 구문 파서(pglast)로 단일 SELECT만 허용합니다.
블랙리스트 키워드 검사는 사용하지 않습니다.
"""

from __future__ import annotations

from pglast import parse_sql
from pglast.ast import RawStmt, SelectStmt
from pglast.parser import ParseError


def prepare_admin_sql_preview(sql: str) -> str:
    """
    단일 SELECT(VALUES/TABLE 포함)만 허용하고, 상위 LIMIT이 없으면 ( … ) LIMIT 101으로 감쌉니다.

    Returns:
        DB에 전달할 최종 SQL 문자열.
    """
    text = (sql or "").strip()
    if not text:
        raise ValueError("empty_sql")

    try:
        stmts = parse_sql(text)
    except ParseError as e:
        raise ValueError(f"invalid_sql: {e}") from e

    if not stmts:
        raise ValueError("empty_sql")

    if len(stmts) != 1:
        raise ValueError("unsafe_sql: only a single statement is allowed")

    raw = stmts[0]
    if not isinstance(raw, RawStmt) or raw.stmt is None:
        raise ValueError("unsafe_sql: invalid statement")

    if not isinstance(raw.stmt, SelectStmt):
        raise ValueError("unsafe_sql: only SELECT queries are allowed")

    if raw.stmt.limitCount is not None:
        return text

    inner = text.rstrip(";").strip()
    return f"({inner}) LIMIT 101"
