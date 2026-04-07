## Context

`backend/app/services/chain.py`의 `run_sql_chain`은 LLM이 tool call을 통해 DB 스키마를 탐색한 후 SQL을 생성하는 구조다. 현재的问题是：

1. **iterations 반복 문제**: LLM이 "데이터 없음"을 판단해도 chain은 `MAX_ITERATIONS=12`까지 계속 호출
2. **종단 신호 부재**: LLM이 텍스트만 응답했을 때 "최종 응답"인지 "다음 탐색 중"인지 판단 불가
3. **frontend 응답**: "데이터 없음" 상태를 HTTP 422로 전달 → 사용자 경험 저하

이改变了`, `backend/app/services/tools.py`, `backend/app/routes/query.py`에 영향.

## Goals / Non-Goals

**Goals:**
- LLM이 "데이터 없음" 등 최종 결론 시 `done()` tool call로 명시적 종단 신호 보냄
- `done` tool call 감지 시 chain 즉시 종료 (iterations 낭비 방지)
- iterations 반복 fallback: 같은 content 패턴 N번 반복 시 강제 종료
- "데이터 없음" 응답을 HTTP 200 + AI 원문 메시지로 frontend에 전달

**Non-Goals:**
- SQL 생성 실패의 모든 원인을 early exit으로 처리 (일부 경계 상황은 기존 iterations 로직 유지)
- LLM이 항상 `done()`을 호출하도록 강제 (fallback mechanism으로 보완)

## Decisions

### 1. `done(reason: str)` tool 추가

**선택:**
- `done()` — reason 파라미터로 종료 사유 전달

**이유:** LLM이 "데이터 없음", "사용자에게 질문 필요" 등 다양한 종단 사유를 표현할 수 있음. system prompt에 `done()` 호출 지침 포함.

**대안:** 키워드 기반 content 분석 — 완전 자동이지만 unreliable.

### 2. `done` call 감지 시 즉시 종료

`run_sql_chain`의 while 루프에서 `done` tool call 감지 → `return None, True` (or `None, "done"`).

**이유:** 명시적 종단 신호이므로 추가 iterations 불필요.

### 3. Iterations 반복 fallback

LLM이 tool call 없이 텍스트만 응답 시, 이전 content와 유사도 체크. N번 반복 시 early exit.

**しきい値:** 3회 (iterations 2→3→4에서 같은 결론 반복 시 exit).

**이유:** `done()` 미호출 상황에서도 반복 방지.

### 4. "데이터 없음" 응답 처리

`generate_sql`에서 early exit 시 (`None` 반환), AI 응답 텍스트를 함께 전달. `/api/query` handler에서 HTTP 200 + `{data: null, message: "AI 원문"}`形式で 응답.

**이유:** 422 대신 200으로 처리하면 frontend에서 일반적인 success handling으로 처리 가능.

## Risks / Trade-offs

- **[Risk]** LLM이 `done()`을 항상 호출하지 않을 수 있음
  - **→ Mitigation:** iterations 반복 fallback으로 보완
- **[Risk]** "iterations content 유사도" 판단이 부정확할 수 있음
  - **→ Mitigation:** 단순 문자열 일치 대신, "데이터 없음" 관련 키워드 조합으로 판단
- **[Risk]** early exit이 잘못 작동하면 정상 SQL 생성도 중간에 끊길 수 있음
  - **→ Mitigation:** `done()`과 반복 fallback 모두 tool call이 있을 때만 작동 (text-only 응답 대상)

## Migration Plan

1. `done()` tool 추가 (tools.py)
2. `run_sql_chain`에 `done` 감지 로직 추가
3. iterations 반복 감지 fallback 추가
4. `generate_sql`에서 early exit 시 AI 응답 전달
5. `/api/query` handler에서 200 + message形式対応
6. System prompt에 `done()` 호출 지침 추가

## Open Questions

- `done(reason)`의 reason을 frontend에 그대로 전달할지, 아니면 별도 포맷팅할지
- iterations 반복 fallback의 "유사도" 판단 기준 — 키워드 조합 or 단순 반복 횟수?
