import logging
from typing import Any

from ..config import settings
from . import schema as schema_service
from .chain import create_sql_chain, run_sql_chain, normalize_sql_for_execution

logger = logging.getLogger(__name__)

_lcel_chain: dict[str, Any] | None = None
_lcel_chain_cache_key: str | None = None


async def _load_schema_digest() -> str:
    try:
        full = await schema_service.get_full_schema()
        return schema_service.format_schema_for_prompt(full)
    except Exception as e:
        logger.warning("DB 스키마 프롬프트 생성 실패: %s", e)
        return "(스키마를 불러오지 못했습니다. get_full_schema 도구를 호출하세요.)"


async def get_lcel_chain():
    """LCEL Chain을 반환한다. 스키마가 바뀌면 새로 생성한다."""
    global _lcel_chain, _lcel_chain_cache_key
    digest = await _load_schema_digest()
    if _lcel_chain is not None and _lcel_chain_cache_key == digest:
        return _lcel_chain
    logger.info("LCEL Chain 생성 중 (스키마 블록 길이=%d)", len(digest))
    _lcel_chain = await create_sql_chain(schema_appendix=digest)
    _lcel_chain_cache_key = digest
    logger.info("LCEL Chain 생성 완료")
    return _lcel_chain


async def generate_sql(question: str) -> str:
    """Generate SQL from user question using LCEL Chain."""
    logger.info(f"Generating SQL for: {question}")

    try:
        chain_info = await get_lcel_chain()
        sql, tool_calls_detected = await run_sql_chain(question, chain_info)
        if sql:
            logger.info(
                "[generate_sql] LCEL Chain SQL 생성 성공 (tool_calls=%s): %s",
                tool_calls_detected,
                sql[:100],
            )
            return normalize_sql_for_execution(sql)
        raise ValueError(
            "모델이 execute_sql 도구로 SQL을 제출하지 않았고, 응답에서 실행 가능한 SQL을 찾을 수 없습니다."
        )
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Error generating SQL: {e}")
        raise


def reset_lcel_chain_cache() -> None:
    """LCEL Chain 캐시를 초기화한다 (스키마 변경 시)."""
    global _lcel_chain, _lcel_chain_cache_key
    _lcel_chain = None
    _lcel_chain_cache_key = None
