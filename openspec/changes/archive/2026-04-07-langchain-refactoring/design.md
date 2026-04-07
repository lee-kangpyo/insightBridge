## Context

현재 LLM 서비스 (`app/services/llm.py`)는 직접 구현한 Function Calling 로직을 사용한다. `generate_sql()` 함수가 Multi-step Tool Calling을 처리하지만, Provider마다 분기처리 코드가 필요하다:

```python
if settings.llm_provider == "minimax":
    return {"role": "function", "name": tool_name, "content": result}
else:
    return {"role": "tool", "tool_call_id": tool_call_id, "content": result}
```

새 Provider 추가 시마다 이 분기처리 코드를 수정해야 하며, Tool 정의도 직접 관리해야 한다.

## Goals / Non-Goals

**Goals:**
- Provider 호환성 자동화 (OpenAI, MiniMax, Claude 등)
- Tool 정의 단순화 (@tool 데코레이터)
- Agent에게 Tool 선택/실행 자동 위임
- 기존 기능 동일하게 유지 (스키마 탐색 → SQL 생성)

**Non-Goals:**
- Memory/Conversation_history 추가 (stateless 쿼리이므로 불필요)
- 복잡한 에이전트 로직 (단순 Function Calling만 사용)
- SQL 직접 실행 (execute_sql은 SQL 생성만, 실행은 API 레벨에서)
- RAG/Retrieval 기능

## Decisions

### 1. LangChain 선택 (vs Guidance)

**선택:** LangChain

**대안:** Guidance
- Guidance는 템플릿 기반으로 간단하지만 커뮤니티/문서가 LangChain보다 작음
- LangChain은 에코시스템이 큼, 향후 확장 용이

### 2. 의존성

**선택:** `langchain-core` + `langchain-community` (메타패키지보다 최소 의존성)

```toml
langchain-core = ">=0.3"
langchain-community = ">=0.3"
```

### 3. ChatModel Wrapper 방식

**선택:** `langchain-community`의 ChatModel wrapper + endpoint 설정

```python
from langchain_community.chat_models import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(
    model=settings.openai_model,
    api_key=settings.openai_api_key,
    base_url=settings.openai_base_url  # MiniMax/OpenAI 모두 endpoint로 처리
)
```

**대안:** 직접 BaseChatModel subclass
- workload 증가, 유지보수 부담

### 4. Tool 정의 방식 - Sync Wrapper Pattern

**선택:** `@tool` 데코레이터 + 내부 sync 래퍼

```python
from langchain_core.tools import tool

@tool
def get_tables() -> str:
    """테이블 목록과 설명을 반환합니다."""
    # sync 함수로 호출 (asyncio.to_thread가 감싸서 실행)
    import asyncio
    loop = asyncio.new_event_loop()
    try:
        tables = loop.run_until_complete(schema_service.get_tables())
    finally:
        loop.close()
    return json.dumps(tables)
```

**참고:** FastAPI의 이미 실행 중인 이벤트 루프에서 `run_until_complete` 사용 시 충돌 가능. `asyncio.to_thread()`로 감싸서 별도 스레드에서 실행 권장.

### 5. Agent 패턴 (LangChain 0.3+ 기준)

**선택:** `create_react_agent` + `AgentExecutor`

```python
# 설치 후 정확한 import 경로 확인 필요
from langchain.agents import create_react_agent  # 또는 langchain_core.agents
from langchain_core.tools import tool
from langchain_core.agents import AgentExecutor

agent = create_react_agent(llm, tools)
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=5,
    early_stopping_method="final"
)
```

**참고:**
- `initialize_agent`는 deprecated됨. `create_react_agent` 사용.
- 실제 import 경로는 패키지 설치 후 `pip show langchain-core`로 확인 필요
- 에이전트 기능은 `langchain` 본패키지 또는 `langchain-core`에 포함될 수 있음 (설치 후 확인)

**Agent가 자동으로:**
1. 사용자 질문 해석
2. 적절한 Tool 선택 (get_tables → get_columns → execute_sql)
3. Tool 실행 및 결과 확인
4. 다음 행동 결정 (계속 또는 종료)

### 6. execute_sql 역할 + Agent 최종 출력 파싱

**설계:** execute_sql tool은 SQL 생성 역할만 담당

```python
# tools.py
@tool
def execute_sql(sql: str) -> str:
    """생성된 SQL을 반환합니다 (실행은 API 레벨에서)."""
    return sql

# llm.py - Agent 실행
result = await agent_executor.invoke({"input": question})
```

**SQL 추출 방식 (중요):**
ReAct Agent의 `result["output"]`은 항상 SQL이 아닐 수 있음 (요약 문장일 가능).

**구현 시 선택:**
1. **도구 호출 추출**: Agent의 intermediate steps에서 마지막 `execute_sql` 호출의 인자를 파싱
2. **출력 파싱**: `result["output"]`에서 SQL 패턴 (`SELECT`, `INSERT` 등) 추출
3. **callback/handler**: Agent 실행 중 `execute_sql` 호출을 가로채서 SQL만 추출

**권장:** 방법 1 또는 3 (도구 호출 레벨에서 확실하게 SQL 획득)

```python
# 예시: 방법 3 - ToolCallCallback
class SQLCaptureCallback(BaseCallbackHandler):
    def on_tool_call(self, tool_call, **kwargs):
        if tool_call.name == "execute_sql":
            self.generated_sql = tool_call.arguments["sql"]
```

**최종 흐름:**
```python
# llm.py
callback = SQLCaptureCallback()
result = await agent_executor.invoke(
    {"input": question},
    {"callbacks": [callback]}
)
sql = callback.generated_sql  # 또는 result["output"] 파싱

# query.py - 라우트에서 실제 SQL 실행
df = await fetch_df(sql)
```

### 7. execute_sql 도구 이름 (참고)

**현재:** `execute_sql` (실행은 하지 않지만这个名字 선택)

**이슈:** 이름이 실제 동작과 다름 (실행，而非生成)

**대안 이름 (향후 검토):**
- `submit_sql` - SQL 제출 (실행은 다른 곳에서)
- `finalize_sql` - SQL 확정
- `return_sql` - SQL 반환

**현재는 유지:** 이름 변경은 migration 비용이 있으므로, 추후 필요시 검토

**참고:** Design 문서 내 Chinese 문자열은 검색 편의를 위해 유지 (원문 의미 변경 없음)

## Risks / Trade-offs

- **[Risk] LangChain 의존성 추가** → Mitigation: 최소 의존성만 추가
- **[Risk] 학습 곡선** → Mitigation: Tools + ReAct Agent만 사용
- **[Risk] 성능 overhead** → Mitigation: Function Calling은 네트워크 I/O가 대부분
- **[Risk] async tool 처리** → Mitigation: `asyncio.to_thread()` 또는 sync wrapper 사용

## Migration Plan

1. **Step 1**: `langchain-core`, `langchain-community` 설치 (에이전트 기능은 `langchain` 본패키지 필요 시 추가)
2. **Step 2**: `app/services/tools.py` 생성 (Tool 정의)
3. **Step 3**: `app/services/chat_models.py` 생성 (ChatModel factory)
4. **Step 4**: `app/services/agent.py` 생성 (AgentExecutor setup + SQLCaptureCallback)
5. **Step 5**: `app/services/llm.py` 리팩토링 (Agent 사용)
6. **Step 6**: 테스트 실행 (기존 기능 동일하게 동작 확인)
7. **Step 7**: 기존 `llm.py` → `llm_old.py` 백업

**Rollback**: `llm_old.py` → `llm.py` 복원

## Open Questions

1. **MiniMax용 ChatModel wrapper** - `langchain-community`에 없으면 ChatOpenAI로 endpoint만 설정
2. **Streaming 지원** - 현재는 불필요, 향후 추가 가능
3. **import 경로 확인** - 패키지 설치 후 `pip show langchain-core`로 실제 경로 확인 필요
4. **SQL 추출 방식** - `result["output"]` 파싱 vs ToolCallCallback 가로채기 중 선택
5. **langchain 패키지 필요 여부** - `create_react_agent`가 langchain 본패키지에만 있으면 pyproject.toml에 추가
