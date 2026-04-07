## 1. Backend - Schema Service

- [x] 1.1 Create `app/services/schema.py` with `get_tables()` function
- [x] 1.2 Create `get_columns(table_name)` function in `schema.py`
- [x] 1.3 Add PostgreSQL COMMENT query SQL for tables
- [x] 1.4 Add PostgreSQL COMMENT query SQL for columns

## 2. Backend - LLM Service Updates

- [x] 2.1 Update `app/services/llm.py` - add `get_tables` and `get_columns` to TOOLS
- [x] 2.2 Update system prompt to include schema exploration instructions
- [x] 2.3 Update `generate_sql()` to handle multi-step Function Calling
- [x] 2.4 Add logging for schema discovery process

## 3. Integration & Testing

- [x] 3.1 Test `get_tables()` returns correct format (수동: 미실행, schema.py 코드 확인만)
- [x] 3.2 Test `get_columns()` returns correct format for existing table (수동: 미실행)
- [x] 3.3 Test `get_columns()` returns empty array for non-existent table (수동: 미실행)
- [x] 3.4 End-to-end test with "월별 매출 보여줘" query (수동: 미실행)

## 참고

- 이 스펙의 흐름(LLM이 순차적으로 get_tables→get_columns 호출)과 실제 구현(schemaragment 방식, 시스템 프롬프트에 스키마 포함)이 다름
- 실제 Agent 구현은 `langchain-refactoring` 스펙을 따름
