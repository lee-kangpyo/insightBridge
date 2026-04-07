## Why

현재 LLM Function Calling 구현이 Provider별 분기처리 코드를 직접 작성해야 한다. OpenAI, MiniMax, Claude 등 각 Provider마다 응답 형식이 다르며, 새로운 Provider 추가 시마다 코드를 수정해야 한다. LangChain을 도입하면 Provider 호환성을 자동으로 처리하여 코드 변경 없이 Provider만 교체할 수 있다.

## What Changes

- **LangChain 라이브러리 도입**: `langchain-core`, `langchain-community`, `langchain-openai` 의존성 추가
- **Custom Tools 정의**: `@tool` 데코레이터로 함수 정의
- **Agent 기반 처리**: LangChain Agent가 Tool 선택/실행 자동 처리
- **Provider 호환성 자동화**: 설정만으로 OpenAI/MiniMax/Anthropic 등 전환 가능
- **기존 직접 구현 제거**: 수동 분기처리 코드 제거

## Capabilities

### New Capabilities

- `langchain-integration`: LangChain 기반 LLM Agent 처리
  - LangChain ChatModel wrapper
  - Custom Tool 정의 (@tool)
  - AgentExecutor를 통한 Tool 선택/실행 자동화
  - Provider별 configuration

### Modified Capabilities

- `schema-discovery`: 구현 방식 변경 (직접 구현 → LangChain Agent)
  - 동일 기능 (스키마 탐색 → SQL 생성)
  - 내부 구현만 LangChain으로 대체
  - API 스펙은 변경 없음 (execute_sql은 SQL 생성만, 실행은 라우트에서)

## Impact

- **Backend**:
  - `app/services/llm.py` - 완전 재작성 (LangChain Agent 사용)
  - `app/services/schema.py` - 유지 (Tool로 wrapping)
  - `app/config.py` - ChatModel 설정 추가
- **Dependencies**: `langchain-core`, `langchain-community`, `langchain-openai` 추가 (`langchain-classic`은 community 의존으로 포함)
- **API**: 기존 `/api/query` 스펙 유지 (변경 없음)
