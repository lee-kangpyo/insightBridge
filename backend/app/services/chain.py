import logging
import re
from typing import Any, AsyncGenerator, Optional

import pandas as pd
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.messages import AIMessage
from langchain_core.messages import ToolMessage
from langchain_core.tools import BaseTool

from .chat_models import create_chat_model
from .tools import execute_sql, get_full_schema, get_columns_batch, done
from ..database import fetch_df

logger = logging.getLogger(__name__)

SQL_TOOL_SYSTEM_PROMPT = """You are a PostgreSQL expert helping users query their database.

Below this message, the **현재 DB 스키마** section lists all public tables with columns, types, and comments. Use it as the primary reference.

Workflow:
1. Prefer calling **execute_sql once** with a valid PostgreSQL SELECT (JOIN/WHERE/GROUP BY as needed) that answers the user, using the schema already shown.
2. If the schema block is missing or clearly outdated, call **get_full_schema** for a fresh JSON snapshot, or **get_columns_batch** with comma-separated table names (e.g. `t1,t2`) for a subset.
3. If you conclusively determine the requested data does not exist in the schema, call **done** with a clear explanation for the user.
4. Do not call get_tables/get_columns unless you inject them as extra tools; the default path assumes schema is already in context.

Critical:
- The application executes ONLY the SQL string passed to execute_sql. If data is not found, use the done tool instead. Do not end with a markdown table, prose-only answer, or Final Answer without calling execute_sql or done.
- Never invent row counts or data; use schema context then submit real SQL via execute_sql.
- Minimize execute_sql calls: avoid throwaway DISTINCT/catalog probes; prefer one final SELECT that answers the question.
- Pass SQL to execute_sql **without leading SQL comments** (no `--` or `/* */` before the statement); start directly with SELECT/WITH.
- Use PostgreSQL syntax only."""

MAX_ITERATIONS = 12


def _normalize_sql_for_execution(s: str) -> str:
    """DB에 넘기기 직전 정규화(선행 주석 제거)."""
    t = s.strip()
    while t:
        if t.startswith("--"):
            i = t.find("\n")
            if i == -1:
                return ""
            t = t[i + 1 :].lstrip()
            continue
        if t.startswith("/*"):
            i = t.find("*/")
            if i == -1:
                return t
            t = t[i + 2 :].lstrip()
            continue
        break
    return t


def is_valid_sql_candidate(s: str) -> bool:
    """말 그대로 'SELECT'만 잡히는 오탐을 걸러낸다."""
    t = _normalize_sql_for_execution(s)
    if len(t) < 15:
        return False
    u = t.lstrip().upper()
    if u.startswith("SELECT") or u.startswith("WITH"):
        return "FROM" in u
    if u.startswith(("INSERT", "UPDATE", "DELETE")):
        return True
    if u.startswith(("EXPLAIN", "SHOW")):
        return len(t) >= 10
    return False


def _parse_tool_call(tc: dict) -> tuple[Optional[str], Optional[dict], Optional[str]]:
    """tool_call dict에서 tool_name, arguments, tool_call_id를 추출.

    MiniMax/OAI 호환: {'name': ..., 'args': ...} 또는 {'function': {'name': ..., 'arguments': ...}}

    Returns:
        (tool_name, arguments, tool_call_id)
    """
    if "function" in tc:
        func = tc["function"]
        name = func.get("name", "") if isinstance(func, dict) else ""
        args = func.get("arguments", "{}") if isinstance(func, dict) else "{}"
    else:
        name = tc.get("name", "")
        args = tc.get("args", "{}")

    tool_call_id = tc.get("id", "")

    if isinstance(args, str):
        import json

        try:
            args = json.loads(args)
        except json.JSONDecodeError:
            args = {}

    return name, args, tool_call_id


def extract_sql_from_tool_calls(response: AIMessage) -> Optional[str]:
    """tool_calls에서 SQL을 추출한다. execute_sql 도구의 인자를 반환."""
    if not hasattr(response, "tool_calls") or not response.tool_calls:
        return None
    for tc in response.tool_calls:
        tool_name, args, _ = _parse_tool_call(tc)
        if tool_name == "execute_sql" and isinstance(args, dict):
            sql = args.get("sql")
            if isinstance(sql, str) and sql.strip():
                return sql.strip()
    return None


def extract_sql_from_content(content: str) -> Optional[str]:
    """content에서 SQL 패턴을 추출한다 (fallback)."""
    if not content or not isinstance(content, str):
        return None
    for pattern in (
        r"(SELECT\b[\s\S]+?\bFROM\b[\s\S]*?)(?:;|\Z)",
        r"(WITH\b[\s\S]+?\bSELECT\b[\s\S]+?\bFROM\b[\s\S]*?)(?:;|\Z)",
        r"(\bINSERT\b[\s\S]+?)(?:;|\Z)",
        r"(\bUPDATE\b[\s\S]+?)(?:;|\Z)",
        r"(\bDELETE\b[\s\S]+?)(?:;|\Z)",
    ):
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        if match:
            cand = match.group(1).strip()
            if is_valid_sql_candidate(cand):
                return _normalize_sql_for_execution(cand)
    return None


def _get_tool_by_name(name: str, tools: list[BaseTool]) -> Optional[BaseTool]:
    for t in tools:
        if t.name == name:
            return t
    return None


async def create_sql_chain(schema_appendix: str = "") -> dict[str, Any]:
    """LCEL Chain을 생성한다. bind_tools + 수동 도구 실행 루프.

    Returns:
        dict with keys: llm, tools, prompt, system_message
    """
    llm = create_chat_model()
    tools = [get_full_schema, get_columns_batch, execute_sql, done]
    llm_with_tools = llm.bind_tools(tools)

    system_content = (
        f"{SQL_TOOL_SYSTEM_PROMPT}\n\n## 현재 DB 스키마 (public)\n\n{schema_appendix}"
    )
    system_message = SystemMessage(content=system_content)

    return {
        "llm": llm_with_tools,
        "llm_raw": llm,
        "tools": tools,
        "prompt": system_message,
        "system_content": system_content,
    }


async def run_sql_chain(
    question: str, chain_info: dict[str, Any]
) -> tuple[Optional[str], bool, Optional[str]]:
    """LCEL Chain을 실행한다.

    Args:
        question: 사용자 질문
        chain_info: create_sql_chain()가 반환한 체인 정보

    Returns:
        (sql, tool_calls_detected) - sql이 None이면 실패
    """
    llm_with_tools = chain_info["llm"]
    tools = chain_info["tools"]
    system_message = chain_info["prompt"]

    messages = [system_message, HumanMessage(content=question)]
    iteration = 0
    iteration_contents = []

    logger.info("[LCEL Chain] 시작: question=%r", question)

    while iteration < MAX_ITERATIONS:
        iteration += 1
        logger.info("[LCEL Chain] iteration=%d, 메시지 수=%d", iteration, len(messages))

        response = await llm_with_tools.ainvoke(messages)
        response_msg = (
            response
            if isinstance(response, AIMessage)
            else AIMessage(content=str(response))
        )

        has_tool_calls = hasattr(response_msg, "tool_calls") and response_msg.tool_calls
        logger.info(
            "[LCEL Chain] iteration=%d has_tool_calls=%s content_preview=%r",
            iteration,
            has_tool_calls,
            (response_msg.content[:200] if response_msg.content else "")[:100],
        )

        if has_tool_calls:
            for tc in response_msg.tool_calls:
                tool_name, arguments, tool_call_id = _parse_tool_call(tc)

                logger.info(
                    "[LCEL Chain] iteration=%d tool_call name=%r tool_call_id=%r arguments_preview=%r",
                    iteration,
                    tool_name,
                    tool_call_id,
                    str(arguments)[:200],
                )

                if tool_name == "execute_sql":
                    sql = extract_sql_from_tool_calls(response_msg)
                    if sql:
                        logger.info(
                            "[LCEL Chain] execute_sql SQL 추출 성공: %s", sql[:100]
                        )
                        return sql, True, None

                if tool_name == "done":
                    reason = arguments.get("reason", "No reason provided") if isinstance(arguments, dict) else str(arguments)
                    logger.info("[LCEL Chain] done 도구 호출 감지, early exit. reason=%r", reason)
                    return None, True, reason

                tool = _get_tool_by_name(tool_name, tools)
                if tool:
                    try:
                        tool_result = await tool.ainvoke(arguments)
                        logger.info(
                            "[LCEL Chain] iteration=%d 도구=%r 결과 미리보기=%r",
                            iteration,
                            tool_name,
                            str(tool_result)[:200],
                        )
                        messages.append(response_msg)
                        messages.append(
                            ToolMessage(
                                content=str(tool_result), tool_call_id=tool_call_id
                            )
                        )
                    except Exception as e:
                        logger.error(
                            "[LCEL Chain] iteration=%d 도구 실행 오류: %s", iteration, e
                        )
                        messages.append(response_msg)
                        messages.append(
                            ToolMessage(
                                content=f"Error: {e}", tool_call_id=tool_call_id
                            )
                        )
                else:
                    logger.warning(
                        "[LCEL Chain] iteration=%d 알 수 없는 도구: %s",
                        iteration,
                        tool_name,
                    )
                    messages.append(response_msg)
                    messages.append(
                        ToolMessage(
                            content=f"Unknown tool: {tool_name}",
                            tool_call_id=tool_call_id,
                        )
                    )
        else:
            logger.info(
                "[LCEL Chain] iteration=%d tool_calls 없음, content에서 SQL 추출 시도",
                iteration,
            )
            messages.append(response_msg)

            sql = extract_sql_from_content(response_msg.content or "")
            if sql:
                logger.info("[LCEL Chain] content에서 SQL 추출 성공: %s", sql[:100])
                return sql, False, None
            
            if response_msg.content:
                iteration_contents.append(response_msg.content)
                if len(iteration_contents) >= 3 and iteration_contents[-1] == iteration_contents[-2] == iteration_contents[-3]:
                    logger.warning("[LCEL Chain] 동일한 응답 3회 반복 감지, early exit.")
                    return None, False, response_msg.content

            if response_msg.content:
                lc = response_msg.content.lower()
                if "final" in lc or "answer" in lc or "완료" in lc:
                    logger.warning(
                        "[LCEL Chain] iteration=%d LLM이 텍스트로만 응답 (SQL 없음): %s",
                        iteration,
                        response_msg.content[:300],
                    )
                    return None, False, response_msg.content

            logger.info(
                "[LCEL Chain] iteration=%d tool_calls도 SQL도 없음, 계속 iteration=%d/%d",
                iteration,
                iteration,
                MAX_ITERATIONS,
            )

    logger.warning("[LCEL Chain] 최대 iteration 도달: %d", MAX_ITERATIONS)
    return None, False, "최대 탐색 횟수를 초과했습니다."


normalize_sql_for_execution = _normalize_sql_for_execution

MAX_CANDIDATES = 3


def _null_ratio(data: list[dict]) -> float:
    """데이터 레코드의 NULL 비율을 계산한다."""
    if not data:
        return 1.0
    total = sum(len(row) for row in data)
    nulls = sum(1 for row in data for v in row.values() if v is None)
    return nulls / total if total > 0 else 1.0


async def run_sql_chain_multi(
    question: str, chain_info: dict[str, Any]
) -> AsyncGenerator[tuple[str, dict], None]:
    """멀티 후보 SQL 루프.

    최대 MAX_CANDIDATES(3)개의 SQL 후보를 생성하고 각각 DB에서 실행한다.
    LLM이 결과를 보고 execute_sql을 다시 호출하면 다음 후보를 시도하고,
    done을 호출하거나 텍스트만 응답하면 종료한다.

    Yields:
        ("candidate", {"index": int, "sql": str, "data": list[dict],
                       "chart_config": dict|None, "evaluation": str})
        ("done", {"best_index": int, "reason": str})
    """
    llm_with_tools = chain_info["llm"]
    tools = chain_info["tools"]
    system_message = chain_info["prompt"]

    messages = [system_message, HumanMessage(content=question)]
    candidates: list[dict] = []
    iteration = 0
    loop_done = False

    logger.info("[MultiChain] 시작: question=%r", question)

    while not loop_done and iteration < MAX_ITERATIONS and len(candidates) < MAX_CANDIDATES:
        iteration += 1
        logger.info(
            "[MultiChain] iteration=%d candidates=%d/%d",
            iteration,
            len(candidates),
            MAX_CANDIDATES,
        )

        response = await llm_with_tools.ainvoke(messages)
        response_msg: AIMessage = (
            response if isinstance(response, AIMessage) else AIMessage(content=str(response))
        )

        has_tool_calls = hasattr(response_msg, "tool_calls") and response_msg.tool_calls

        if not has_tool_calls:
            logger.info(
                "[MultiChain] iteration=%d 도구 호출 없음(텍스트 응답), 루프 종료",
                iteration,
            )
            messages.append(response_msg)
            break

        messages.append(response_msg)

        for tc in response_msg.tool_calls:
            tool_name, arguments, tool_call_id = _parse_tool_call(tc)
            logger.info(
                "[MultiChain] iteration=%d tool_call=%r tool_call_id=%r",
                iteration,
                tool_name,
                tool_call_id,
            )

            if tool_name == "execute_sql":
                sql = (
                    arguments.get("sql", "").strip()
                    if isinstance(arguments, dict)
                    else ""
                )

                if not sql:
                    messages.append(
                        ToolMessage(
                            content="Error: SQL이 비어있습니다.",
                            tool_call_id=tool_call_id,
                        )
                    )
                    break

                sql = _normalize_sql_for_execution(sql)
                chart_config = extract_chart_config_from_tool_calls(response_msg)

                try:
                    df = await fetch_df(sql)
                    data_records = (
                        df.where(pd.notnull(df), None).to_dict(orient="records")
                    )

                    result_summary = f"SQL 실행 결과: {len(df)} 행\n"
                    cols = df.columns.tolist()
                    null_cols = [c for c in cols if df[c].isnull().all()]
                    if null_cols:
                        result_summary += f"⚠️ 전체 NULL 컬럼: {', '.join(null_cols)}\n"
                    result_summary += df.head(5).to_string(index=False)

                    messages.append(
                        ToolMessage(content=result_summary, tool_call_id=tool_call_id)
                    )

                    candidate_idx = len(candidates)
                    null_r = _null_ratio(data_records)
                    candidates.append(
                        {
                            "sql": sql,
                            "data": data_records,
                            "chart_config": chart_config,
                            "evaluation": result_summary,
                            "_null_ratio": null_r,
                        }
                    )

                    logger.info(
                        "[MultiChain] 후보 %d 추가 (rows=%d, null_ratio=%.3f)",
                        candidate_idx,
                        len(df),
                        null_r,
                    )

                    yield (
                        "candidate",
                        {
                            "index": candidate_idx,
                            "sql": sql,
                            "data": data_records,
                            "chart_config": chart_config,
                            "evaluation": result_summary,
                        },
                    )

                except Exception as e:
                    error_msg = f"SQL 실행 오류: {e}"
                    logger.warning("[MultiChain] %s", error_msg)
                    messages.append(
                        ToolMessage(content=error_msg, tool_call_id=tool_call_id)
                    )

                break

            elif tool_name == "done":
                reason = (
                    arguments.get("reason", "완료")
                    if isinstance(arguments, dict)
                    else str(arguments)
                )
                logger.info("[MultiChain] done 도구 호출, 루프 종료. reason=%r", reason)
                messages.append(
                    ToolMessage(content=reason, tool_call_id=tool_call_id)
                )
                loop_done = True
                break

            else:
                tool = _get_tool_by_name(tool_name, tools)
                if tool:
                    try:
                        tool_result = await tool.ainvoke(arguments)
                        logger.info(
                            "[MultiChain] iteration=%d 도구=%r 결과 미리보기=%r",
                            iteration,
                            tool_name,
                            str(tool_result)[:200],
                        )
                        messages.append(
                            ToolMessage(
                                content=str(tool_result), tool_call_id=tool_call_id
                            )
                        )
                    except Exception as e:
                        logger.error(
                            "[MultiChain] iteration=%d 도구 실행 오류 %r: %s",
                            iteration,
                            tool_name,
                            e,
                        )
                        messages.append(
                            ToolMessage(
                                content=f"Error: {e}", tool_call_id=tool_call_id
                            )
                        )
                else:
                    logger.warning(
                        "[MultiChain] iteration=%d 알 수 없는 도구: %s",
                        iteration,
                        tool_name,
                    )
                    messages.append(
                        ToolMessage(
                            content=f"Unknown tool: {tool_name}",
                            tool_call_id=tool_call_id,
                        )
                    )

    if not candidates:
        logger.warning("[MultiChain] 후보 SQL이 없습니다.")
        yield ("done", {"best_index": -1, "reason": "실행 가능한 SQL 후보가 없습니다."})
        return

    best_idx = min(range(len(candidates)), key=lambda i: candidates[i]["_null_ratio"])
    best_null_r = candidates[best_idx]["_null_ratio"]
    reason = (
        f"후보 {len(candidates)}개 중 NULL 비율이 가장 낮은 후보 {best_idx}번 선택 "
        f"(NULL ratio={best_null_r:.3f})"
    )
    logger.info("[MultiChain] 최적 후보 선택: %s", reason)
    yield ("done", {"best_index": best_idx, "reason": reason})
