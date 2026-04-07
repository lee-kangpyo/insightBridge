# Architecture

## Overall Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Frontend  │────▶│   Backend   │────▶│  Database   │
│  (Question) │     │  (React)    │     │  (FastAPI)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                   │
                           │                   ▼
                           │            ┌─────────────┐
                           │            │  LLM API    │
                           │            │(OpenAI/GPT) │
                           │            └─────────────┘
                           ▼
                    ┌─────────────┐
                    │   ECharts   │
                    │   (차트)    │
                    └─────────────┘
```

## Backend Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI 진입, CORS, 라우트 등록
│   ├── config.py            # pydantic-settings로 env 로드
│   ├── database.py          # asyncpg로 PostgreSQL 연결
│   ├── schemas.py           # 요청/응답 Pydantic 모델
│   ├── routes/
│   │   └── query.py         # /api/query 엔드포인트
│   └── services/
│       └── llm.py           # OpenAI API + Function Calling
```

## LLM Processing Flow

### Step 1: SQL Generation (Function Calling)
```python
# LLM이 텍스트에서 SQL을 생성
messages = [{"role": "user", "content": "작년 월별 매출 보여줘"}]
tools = [{
    "type": "function",
    "function": {
        "name": "execute_sql",
        "parameters": {
            "type": "object",
            "properties": {
                "sql": {"type": "string"}
            }
        }
    }
}]
# LLM이 {"sql": "SELECT month, SUM(sales)..."} 형태로 반환
```

### Step 2: SQL Execution
```python
# 백엔드에서 SQL 실행 → pandas DataFrame 변환
df = await db.fetch_df(sql)
```

### Step 3: Data Processing (TBD)
```
┌──────────────────────────────────────────────────────────────┐
│                    [미결정 사항]                               │
│                                                              │
│  옵션 A: 백엔드에서 pandas로 가공                               │
│         - 속도 빠름, 비용 낮음                                 │
│         - 복잡한 가공는 LLM 2차 호출 필요                      │
│                                                              │
│  옵션 B: LLM이 pandas 코드 생성 + 실행                        │
│         - 복잡한 가공 용이                                    │
│         - 보안/성능 이슈要考虑                                 │
│                                                              │
│  → docs/OPEN_ISSUES.md 참조                                  │
└──────────────────────────────────────────────────────────────┘
```

## API Endpoints

### POST /api/query
```json
// Request
{
  "question": "작년 월별 매출을 보여줘"
}

// Response (TBD: 가공 방식 결정 후 스키마 변경 가능)
{
  "data": [...],
  "chart_config": {...},
  "sql": "SELECT ..."
}
```

## Frontend Architecture

```
frontend/
├── src/
│   ├── App.jsx              # 메인 앱
│   ├── components/
│   │   └── ChartRenderer.jsx   # ECharts 래퍼
│   ├── pages/
│   │   └── QueryPage.jsx   # 쿼리 입력 + 결과 차트
│   └── services/
│       └── api.js          # FastAPI 호출 (axios/fetch)
```

## Security Considerations (TBD)

1. **SQL Injection**: Function Calling의 스키마로 제한
2. **LLM Generated Code**: pandas 코드 실행 시 화이트리스트 or 샌드박스
3. **Data Access**: 사용자별 데이터 권한 (미래 확장)

## Performance Considerations (TBD)

1. **Large Dataset**: 100만 row+ 처리 방식 (샘플링 vs 전체 전송)
2. **Caching**: 동일한 질문에 대한 결과 캐싱
3. **Async**: 비동기 처리로 동시 요청 대응
