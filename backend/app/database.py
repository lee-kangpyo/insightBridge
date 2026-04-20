import asyncio
import asyncpg
from typing import Optional
import pandas as pd
from .config import settings

_pool: Optional[asyncpg.Pool] = None
_main_loop = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(settings.database_url)
    return _pool


async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


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


def get_main_loop():
    return _main_loop
