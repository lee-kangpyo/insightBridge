import asyncio
import asyncpg
from typing import Optional
import pandas as pd
from .config import settings

_pool: Optional[asyncpg.Pool] = None
_pool_readonly: Optional[asyncpg.Pool] = None
_main_loop = None


def _readonly_pool_dsn() -> str:
    return settings.database_url_readonly or settings.database_url


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(settings.database_url)
    return _pool


async def get_pool_readonly() -> asyncpg.Pool:
    """
    SQL 미리보기 등 읽기 전용 쿼리용 풀.
    default_transaction_read_only=on 으로 DML/DDL 및 수정 CTE를 DB 단에서 차단합니다.
    (연결 역할이 SUPERUSER이면 PostgreSQL이 이 제한을 우회할 수 있으므로 전용 비슈퍼 역할 DSN 권장.)
    """
    global _pool_readonly
    if _pool_readonly is None:
        _pool_readonly = await asyncpg.create_pool(
            _readonly_pool_dsn(),
            server_settings={"default_transaction_read_only": "on"},
        )
    return _pool_readonly


async def close_pool():
    global _pool, _pool_readonly
    if _pool:
        await _pool.close()
        _pool = None
    if _pool_readonly:
        await _pool_readonly.close()
        _pool_readonly = None


async def fetch_df(sql: str, params: tuple = ()) -> pd.DataFrame:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)
        if not rows:
            return pd.DataFrame()
        columns = list(rows[0].keys())
        data = [dict(row) for row in rows]
        df = pd.DataFrame(data, columns=columns)
        return df.replace({pd.NA: None, float('nan'): None})


async def fetch_df_readonly(sql: str, params: tuple = ()) -> pd.DataFrame:
    """읽기 전용 풀에서 SELECT 계열 쿼리만 실행합니다(미리보기용)."""
    pool = await get_pool_readonly()
    async with pool.acquire() as conn:
        rows = await conn.fetch(sql, *params)
        if not rows:
            return pd.DataFrame()
        columns = list(rows[0].keys())
        data = [dict(row) for row in rows]
        df = pd.DataFrame(data, columns=columns)
        return df.replace({pd.NA: None, float('nan'): None})


def get_main_loop():
    return _main_loop
