## Backend (FastAPI)

### Run

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment

- `.env`에 `DATABASE_URL`이 설정되어 있어야 합니다.

### Added APIs

- `GET /api/overview/matrix-points`
  - `screen_base_year`(필수), `schl_nm`(선택) 등으로 `tq_overview_matrix_point` 조회

