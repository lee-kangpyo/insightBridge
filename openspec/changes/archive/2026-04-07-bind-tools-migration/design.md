## Context

기존 `langchain-refactoring` 스펙에서 `create_openai_tools_agent`(OpenAI tools/bind_tools 스타일)로 구현했으나, MiniMax 모델이 `tool_calls` 구조 대신 자유 텍스트로 답변하는 문제가 발생.

**현재 아키텍처:**
```
llm.py: generate_sql() → get_agent_executor() → create_agent_executor()
                                         ↓
                              create_openai_tools_agent (OAI tools)
                                         ↓
                              AgentExecutor → execute_sql 도구
```

**문제:**
- MiniMax 모델이 `tool_calls` 응답 대신 `content`로 직접 답변
- `execute_sql` 도구 미호출 → SQL 캡처 실패
- 현재 AgentExecutor + create_openai_tools_agent 방식에서 모델 행동 제어 제한

## Goals / Non-Goals

**Goals:**
- MiniMax 모델의 `tool_calls` 구조 응답 유도
- LCEL Chain + `bind_tools` 방식의 명확한 구현
- SQL 캡처 로직 단순화
- 도구 미사용 시 fallback 처리

**Non-Goals:**
- Provider 추상화 (현재 ChatOpenAI factory 유지)
- 새로운 도구 추가 (현재 도구 그대로 사용)
- DB 스키마 변경
- ReAct 에이전트 완전 제거 (비교 목적으로 legacy로 유지)

## Decisions

### 1. LCEL Chain으로의 전환

**선택:** `create_openai_tools_agent` + AgentExecutor → LCEL Chain (`Prompt → LLM.bind_tools() → Tool`)

**대안:**
- `create_openai_tools_agent` 유지: AgentExecutor가 추상화 제공하지만 디버깅 어려움
- 직접 `llm.bind_tools()` + 수동 루프: 최대 제어권 but 복잡

**이유:**
- LangChain 표준 LCEL 패턴이 디버깅/수정 용이
- `response.tool_calls`에서 직접 SQL 추출 가능
- 각 단계(프롬프트 → LLM → 도구 → LLM)를 명시적으로 제어

### 2. 모델 응답 처리 구조

**선택:** `llm.bind_tools([execute_sql, get_full_schema, get_columns_batch])` 후:
1. `response.tool_calls` 확인
2. 도구 실행 → 결과 → 다음 LLM 호출
3. `tool_calls` 없으면 `response.content`에서 SQL 패턴 추출 시도

**이유:**
- MiniMax가 `tool_calls` 사용 시 구조화되어 추출 용이
- 미사용 시에도 fallback으로 SQL 패턴 매칭 시도
- 완전히 실패 시 기존 에이전트로 fallback

### 3. SQL 캡처 방식

**선택:** `response.tool_calls[0].function.arguments` 또는 `on_tool_start` callback

**이유:**
- OpenAI tools 방식에서는 `tool_calls`에 함수명/인자가 구조화됨
- `execute_sql` 호출 시 `function.arguments`에서 직접 SQL 추출
- 기존 `SQLCaptureCallback.on_tool_start` 재사용 가능

### 4. Fallback 전략

**선택:**
```
LCEL Chain (bind_tools)
    ↓ tool_calls 있음
도구 실행 → 결과 → 다음 LLM 호출
    ↓ tool_calls 없음
response.content에서 SQL 패턴 추출
    ↓ 실패
기존 AgentExecutor (create_openai_tools_agent) fallback
```

**이유:**
- 점진적退化 (graceful degradation)
- 새 방식이 실패해도 기존 시스템으로 동작
- 문제 원점 격리 용이

## Risks / Trade-offs

- **[Risk] MiniMax API의 tool_calls 지원 한계**
  - API가 `tools` 파라미터를 받아도 `tool_calls`로 응답 안 할 수 있음
  - **Mitigation**: fallback에서 SQL 패턴 추출 + 기존 AgentExecutor fallback

- **[Risk] LCEL Chain 디버깅 복잡성**
  - 단계가 많으면 에러 추적이 어려움
  - **Mitigation**: 각 단계별 로깅 강화

- **[Risk] 기존 코드와 중복**
  - legacy 에이전트와 새 체인이 공존
  - **Mitigation**: 새 방식이 완전히 동작 확인되면 legacy 제거

## Migration Plan

**Phase 1: 새 LCEL Chain 구현**
- `app/services/chain.py` 생성 (새 LCEL Chain)
- `llm.py`에 새 Chain 선택 옵션 추가 (`USE_LCEL_CHAIN=true`)
- 로깅으로 `tool_calls` 응답 여부 확인

**Phase 2: 테스트 및 검증**
- MiniMax에서 `tool_calls` 응답 형태 확인
- Fallback 정상 동작 확인

**Phase 3: 기존 에이전트 제거 (선택)**
- 새 방식 안정화 후 legacy 코드 제거
- `USE_REACT_AGENT`, `create_sql_react_agent_executor` 등

## Open Questions

1. **MiniMax의 tool_calls 지원 범위**: API 문서에서 확인 필요
2. **LCEL Chain의 iteration 제어**: 기존 AgentExecutor의 `max_iterations` 같은 제어 필요 여부
3. **시스템 프롬프트 분리**: 기존 `SQL_TOOL_SYSTEM_PROMPT`을 Chain에 맞게 재작성
