## Why

LLM이 DB에 데이터가 없음을 판단해도, chain은 `MAX_ITERATIONS=12`까지 반복하며 불필요한 API 호출을 계속한다. iteration 2에서 이미 "데이터 없음" 판정이 났는데 10회를 더 돌며 비용과 지연을 낭비한다.

## What Changes

- `done(reason)` 도구 추가: LLM이 "데이터 없음" 등 최종 결론 시 호출. tool call로 종단 신호를 보냄.
- `run_sql_chain`에서 `done` tool call 감지 시 즉시 종료 (None 반환)
- iterations 반복 fallback: 같은 content 패턴이 N번 반복 시 early exit
- "데이터 없음" 응답 시 frontend에 200 + AI 원문 응답 전달

## Capabilities

### New Capabilities
- `llm-early-exit`: LLM 종단 신호 감지 및 처리. `done()` tool call 또는 iterations 반복 감지로 chain을 조기 종료.

### Modified Capabilities
- (없음 — 기존 `schema-discovery` 스펙의 동작 변경 없음)

## Impact

- `backend/app/services/tools.py`: `done()` 도구 추가
- `backend/app/services/chain.py`: `done` 감지 로직, iterations 반복 감지 fallback
- `backend/app/routes/query.py`: "데이터 없음" 응답 처리 (200 + AI 메시지)
- `backend/app/services/llm.py`: early termination 시 `None` 대신 AI 응답 전달
