## Why

현재 LLM이 SQL을 생성할 때 DB 스키마(테이블/컬럼 정보)를 알지 못해 적절한 쿼리를 생성하지 못한다. 사용자가 "월별 매출 보여줘"라고 요청해도 LLM은 테이블 목록조차 모른 채 오류SQL을 생성한다. PostgreSQL의 COMMENT 기능을 통해 저장된 스키마 메모리를 활용하면, AI가 스스로 스키마를 탐색하고 정확한 SQL을 생성할 수 있다.

## What Changes

- **테이블 목록 조회 Function 추가**: `get_tables()` - 테이블명 + COMMENT 메모 포함 반환
- **컬럼 목록 조회 Function 추가**: `get_columns(table_name)` - 컬럼명 + COMMENT 메모 포함 반환
- **AI 자동 스키마 탐색**: LLM이 get_tables() → get_columns()를 순차 호출하여 스키마 파악 후 SQL 생성
- **사용자 개입 최소화**: 테이블/컬럼 선택을 AI가 자동 수행

## Capabilities

### New Capabilities

- `schema-discovery`: LLM이 DB 스키마를 스스로 탐색하는 기능
  - `get_tables()` Function: 테이블 목록 + COMMENT 메모 반환
  - `get_columns(table_name)` Function: 특정 테이블의 컬럼 목록 + COMMENT 메모 반환
  - AI 프롬프트에 스키마 탐색 로직 내장

### Modified Capabilities

- 기존 `query-api`: `/api/query` 엔드포인트의 동작 방식 변경 없음 (내부 로직만 확장)

## Impact

- **Backend**: `app/services/llm.py` - Function Calling 구조 확장
- **Backend**: `app/services/schema.py` (신규) - 스키마 조회 서비스
- **Database**: COMMENT 메모가 저장되어 있어야 탐색 가능
- **API**: 기존 `/api/query` 스펙 유지, 내부 처리 로직 변경
