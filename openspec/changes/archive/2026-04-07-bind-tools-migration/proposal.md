# bind-tools-migration

## Status

Draft

## Created

2026-04-07

## Motivation

기존 `langchain-refactoring` 스펙에서 구현한 `create_openai_tools_agent`(OpenAI tools/bind_tools 스타일)가 MiniMax 모델에서 SQL 생성 없이 텍스트 답변만 반환하는 문제가 발생.

## Goals

- MiniMax 모델에서 구조화된 `tool_calls` 응답 확인
- LCEL Chain + bind_tools 방식의 명확한 구현
- SQL 캡처 로직 단순화

## Problems

- MiniMax가 도구 호출 응답(`tool_calls`) 대신 자유 텍스트로 답변
- `execute_sql` 도구 미호출 → SQL 캡처 실패
- ReAct 프롬프트 유지보수 부담

## Approach

1. LCEL Chain으로 `Prompt → LLM.bind_tools() → Tool → LLM` 흐름 구성
2. MiniMax API에서 `tool_calls` 구조 응답 확인
3. 실패 시 `tool_calls` 미응답 → `content` 직접 답변Fallback

## Related

- 아카이브: `langchain-refactoring`, `llm-schema-discovery`
