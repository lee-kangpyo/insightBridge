## 1. Dependencies Setup

- [x] 1.1 Install `langchain-core` package via uv
- [x] 1.2 Install `langchain-community` package via uv
- [x] 1.3 Verify installation

## 2. Config Updates

- [x] 2.1 Update `app/config.py` - add ChatModel settings (llm_provider, model, temperature)
- [x] 2.2 Update `.env.example` - add LangChain-related configuration options

## 3. Tool Definitions

- [x] 3.1 Create `app/services/tools.py` - define `@tool` decorated functions
- [x] 3.2 Implement `get_tables_tool` using `schema_service.get_tables()`
- [x] 3.3 Implement `get_columns_tool` using `schema_service.get_columns()`
- [x] 3.4 Implement `execute_sql_tool` - returns SQL string (actual execution at API layer)

## 4. ChatModel & Agent Setup

- [x] 4.1 Create `app/services/chat_models.py` - provider-specific ChatModel factory
- [x] 4.2 Implement `create_chat_model()` function with provider detection
- [x] 4.3 Create `app/services/agent.py` - AgentExecutor setup with SQLCaptureCallback
- [x] 4.4 Implement `create_agent_executor()` function with max_iterations=5

## 5. LLM Service Refactoring

- [x] 5.1 Refactor `app/services/llm.py` - replace direct implementation with Agent
- [x] 5.2 Update `generate_sql()` to use AgentExecutor
- [x] 5.3 Remove manual `format_tool_result()` and multi-step loop
- [x] 5.4 Verify provider compatibility (minimax/openai) — `create_chat_model()`에서 알려진 provider 로깅·경고

## 6. Testing & Verification

- [x] 6.1 Test import verification (uv run python -c "from app.services import llm; print('OK')")
- [x] 6.2 End-to-end test with "대학별 재학생수" query (수동: 2026-04-07 실행, MiniMax가 SQL 생성 없이 텍스트 테이블로 응답 — ReAct/bind_tools 모두 도구 미사용)
- [x] 6.3 Test provider switching (minimax → openai if available) (수동: 미실행 — MiniMax에서 문제가 ReAct 방식 때문인지 확인 필요)

## 참고

- max_iterations: 스펙은 5, 실제 코드는 12 (tasks.md 4.4 미정확)
- Agent 유형: 스펙은 create_react_agent, 실제는 create_openai_tools_agent 사용
- 도구: 스펙은 get_tables/get_columns, 실제는 get_full_schema/get_columns_batch
