## Context

현재 `generate_sql()` 함수는 단일 Function Calling (`execute_sql`)만 사용한다. LLM은 질문만 받고 DB 스키마를 알지 못하므로 잘못된 SQL을 생성하거나, 테이블 목록부터 확인해야 하는 2단계 과정이 필요하다.

**현재 흐름:**
```
[사용자: "월별 매출 보여줘"]
→ LLM: SQL 생성 (스키마 모름)
→ 오류SQL 또는 부적절한 결과
```

**개선된 흐름:**
```
[사용자: "월별 매출 보여줘"]
→ LLM: get_tables() 호출
→ LLM: 테이블 목록 + COMMENT 확인 → 적절한 테이블 식별
→ LLM: get_columns("해당테이블") 호출
→ LLM: 컬럼 목록 + COMMENT 확인
→ LLM: 최종 SQL 생성 → execute_sql()
```

## Goals / Non-Goals

**Goals:**
- LLM이 DB 스키마를 스스로 탐색 가능
- PostgreSQL COMMENT 메모를 활용한 스키마 문서화
- 테이블/컬럼 선택의 자동화 (사용자 개입 최소화)

**Non-Goals:**
- 사용자가 테이블을 직접 선택하는 UI 제공 (AI 자동 선택)
- COMMENT 메모 자동 생성 기능
- 다른 DB 지원 (PostgreSQL만)

## Decisions

### 1. Function Calling 구조 확장

**선택:** 3개의 Function 제공
- `get_tables()` - 테이블 목록 + COMMENT 반환
- `get_columns(table_name)` - 특정 테이블의 컬럼 + COMMENT 반환
- `execute_sql(sql)` - SQL 실행 (기존 유지)

**대안:** 단일 Function으로 모든 처리
- 복잡도 증가, 디버깅 어려움
- 유지보수 불리

### 2. AI 프롬프트 전략

**선택:** 시스템 프롬프트에 순차적 Function 호출 로직 내장

```python
SYSTEM_PROMPT = """
You have access to database schema exploration tools:
1. get_tables() - List all tables with their COMMENT descriptions
2. get_columns(table_name) - Get columns for a specific table with descriptions
3. execute_sql(sql) - Execute SQL query

Follow this process:
1. First, call get_tables() to discover available tables
2. Identify the relevant table based on table names and comments
3. Call get_columns() to understand the column structure
4. Generate and execute SQL using execute_sql()
"""
```

### 3. COMMENT 조회 SQL

```sql
-- 테이블 목록 + COMMENT
SELECT 
    c.relname AS table_name,
    obj_description(c.oid) AS table_comment
FROM pg_class c
WHERE c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace;

-- 컬럼 목록 + COMMENT
SELECT 
    a.attname AS column_name,
    col_description(a.attrelid, a.attnum) AS column_comment
FROM pg_attribute a
WHERE a.attrelid = 'tablename'::regclass AND a.attnum > 0;
```

## Risks / Trade-offs

- **[Risk] COMMENT 미작성 테이블/컬럼** → Mitigation: 빈 문자열 반환, AI가 테이블명 기반으로 판단
- **[Risk] 대규모 DB (100+ 테이블)** → Mitigation: LLM 컨텍스트 제한, 관련 테이블만 선별
- **[Risk] Function Calling 2회 호출 (토큰 비용)** → Mitigation: 대부분의 쿼리는 2회 내에 완료 예상

## Open Questions

1. COMMENT가 없을 때 테이블명 기반 유사匹配 전략 필요 여부
2. 여러 테이블 조인이 필요할 때 get_columns() 호출 전략
3. 스키마 캐싱 여부 (매번 조회 vs 메모이제이션)
