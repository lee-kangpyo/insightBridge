# Tech Stack Details

## Backend

### FastAPI
- Python 3.11+
- **uv** (패키지/프로젝트 관리)
- 비동기 지원 (async/await)
- OpenAPI 자동 생성

### 주요 의존성
```
fastapi
uvicorn
asyncpg          # PostgreSQL async 드라이버
pydantic
pydantic-settings
openai            # OpenAI API client
python-dotenv
pandas            # 데이터 가공 (TBD)
```

### uv 사용
```bash
cd backend
uv init
uv add fastapi uvicorn asyncpg pydantic pydantic-settings openai python-dotenv pandas
```

---

## Frontend

### React
- Vite (빌드 도구)
- ECharts (차트 라이브러리)
- axios (API 호출)

### 주요 의존성
```
react
react-dom
echarts
echarts-for-react
axios
```

### Vite 프로젝트 생성
```bash
cd frontend
npm create vite@latest . -- --template react
npm install echarts echarts-for-react axios
```

---

## Database

### PostgreSQL
- 기존 DB 사용 (별도 존재)
- 연결 정보는 `DATABASE_URL` env로 관리

### 테이블 접근
- LLM이 SQL 생성 시 사용할 수 있는 테이블 목록 제공 필요
- 샘플 스키마 또는 실제 스키마 공유 필요

---

## LLM

### OpenAI API
- **Function Calling** 사용
- 모델: `gpt-4` (기본)

### Function Calling 예시
```python
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

messages = [{"role": "user", "content": "월별 매출 보여줘"}]
tools = [{
    "type": "function",
    "function": {
        "name": "execute_sql",
        "description": "Execute SQL query on database",
        "parameters": {
            "type": "object",
            "properties": {
                "sql": {
                    "type": "string",
                    "description": "SQL query to execute"
                }
            },
            "required": ["sql"]
        }
    }
}]

response = client.chat.completions.create(
    model="gpt-4",
    messages=messages,
    tools=tools
)
# response.choices[0].message.tool_calls[0].function.arguments
```

### API 설정
```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    openai_base_url: str = "https://api.openai.com/v1"
    openai_model: str = "gpt-4"
    
    class Config:
        env_file = ".env"
```

---

## 차트 라이브러리 비교

| 라이브러리 | 히트맵 | 인터랙티브 | React 호환성 |
|-----------|--------|-----------|-------------|
| **ECharts** | ✅ | ✅ 높음 | ✅ echarts-for-react |
| Recharts | ❌ | ✅ | ✅ |
| Nivo | ✅ | ✅ | ✅ |
| ApexCharts | ✅ | ✅ | ⚠️ 별도 래퍼 필요 |

**선택: ECharts**
- 히트맵 포함 다양한 차트 지원
- 인터랙티브 기능 강력
- React 래퍼 (`echarts-for-react`) 존재

---

##今后的扩展

### Spring Boot + Next.js 전환 시
```
현재                  →  将来实现
FastAPI (Python)      →  Spring Boot (Java)
React + ECharts       →  Next.js + ECharts
PostgreSQL           →  PostgreSQL (재사용)
OpenAI API           →  同上 (재사용)
```

- **API contract 유지**: `/api/query` 스펙 동일
- **DB 스키마 재사용**: 그대로 사용 가능
- **LLM 연동 재사용**: API 설정만 변경
