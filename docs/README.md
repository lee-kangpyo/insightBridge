# InsightBridge

LLM을 활용하여 자연어를 SQL로 변환하고, 차트로 시각화하는 대시보드 프로젝트

## Tech Stack

| 계층 | 기술 |
|------|------|
| Backend | FastAPI + uv |
| Frontend | React + ECharts |
| Database | PostgreSQL |
| LLM | OpenAI API (Function Calling) |

## Project Structure

```
insightBridge/
├── backend/              # FastAPI 백엔드
│   ├── app/
│   │   ├── main.py       # 앱 진입점
│   │   ├── config.py     # 환경변수 로드
│   │   ├── database.py   # DB 연결
│   │   ├── schemas.py    # Pydantic 모델
│   │   ├── routes/       # API 라우트
│   │   └── services/     # LLM 서비스 등
│   ├── pyproject.toml
│   └── .env
├── frontend/             # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/   # UI 컴포넌트
│   │   └── services/     # API 호출
│   └── .env
└── docs/                 # 문서
```

## Flow

```
[사용자 질문]
       ↓
[LLM: SQL 생성 (Function Calling)]
       ↓
[백엔드: SQL 실행 → pandas DataFrame]
       ↓
[프론트: ECharts로 차트 렌더링]
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:port/database
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

## Feature Docs

### 핵심 아키텍처
- `DYNAMIC_QUERY_CONFIG.md`: 동적 쿼리 구성 시스템 (tq_screen_*, tq_overview_*)
- `ARCHITECTURE.md`: 전체 아키텍처 및 LLM 처리 플로우
- `STACK.md`: 기술 스택 상세

### 기능별 문서
- `PLAN_overview_matrix.md`: `tq_overview_matrix_point` 기반 매트릭스 구현 계획
- `ARCHITECTURE_overview_matrix.md`: 매트릭스 기능 아키텍처(나중에 AI가 참고)
- `PLAN_product_mvp.md`: 다른 위젯 확장용 큰 그림 Plan

### 이슈 및 TODO
- `OPEN_ISSUES.md`: 해결되지 않은 이슈들
