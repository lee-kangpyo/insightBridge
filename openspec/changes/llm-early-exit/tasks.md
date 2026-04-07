## 1. done tool 추가

- [ ] 1.1 `tools.py`에 `done(reason: str)` 도구 추가
- [ ] 1.2 system prompt에 `done()` 호출 지침 추가 (스키마에 데이터 없으면 `done` 호출)

## 2. chain에서 done 감지 로직

- [ ] 2.1 `run_sql_chain`에서 `done` tool call 감지 시 즉시 종료 (None 반환)
- [ ] 2.2 `run_sql_chain`에서 iterations 반복 content 감지 (3회 반복 시 early exit)

## 3. early termination 응답 처리

- [ ] 3.1 `generate_sql`에서 early exit 시 (`done` 또는 iterations fallback) AI 응답 텍스트 함께 전달
- [ ] 3.2 `/api/query` handler에서 HTTP 200 + `{data: null, message: <reason>}` 형태로 반환

## 4. 검증

- [ ] 4.1 "학사경고 대비 자퇴율" 질문으로 early termination 동작 확인 (iteration 3 이하에서 종료)
- [ ] 4.2 정상 SQL 생성 질문에서는 early termination 작동 안 함 확인
