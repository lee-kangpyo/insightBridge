# Overview Matrix (tq_overview_matrix_point) 구현 계획

## 목표

- PostgreSQL의 `public.tq_overview_matrix_point` 데이터를 조회해, 메인 화면의 `StrengthWeaknessMatrix`(사분면 산점도)에 렌더링한다.
- **현재는 한 학교 기준(충남대학교)** 으로 동작하도록 “임의 기본값”을 두고, 이후 유저 컨텍스트(로그인/프로필)의 학교 정보로 치환 가능하게 구조화한다.

## 현재 코드베이스 기준 전제

- Backend: FastAPI + asyncpg 풀(`backend/app/database.py`)
- Frontend: React + Vite + axios(`frontend/src/services/api.js`)
- 메인 페이지는 현재 `main_page_samples.json` 샘플을 사용(`frontend/src/pages/MainPage.jsx`)

## API 설계(백엔드)

### 엔드포인트

- `GET /api/overview/matrix-points`

### Query Params

- `screen_code` (기본: `overview`)
- `screen_ver` (기본: `v0.1`)
- `screen_base_year` (필수)
- `metric_year` (선택)
- `schl_nm` (선택, 기본은 프론트에서 `충남대학교`)
- `metric_code` (선택)

### 응답 모델(프론트가 바로 소비 가능한 shape)

```json
{
  "title": "강점/약점 매트릭스",
  "xAxisLabel": "지역 평균 대비 격차",
  "yAxisLabel": "전국 평균 대비 격차 방향 보정값",
  "points": [
    {
      "id": "충남대학교:M01_FRESHMAN_FILL:2025",
      "name": "신입충원",
      "x": 62.3,
      "y": 41.9,
      "colorHex": "#2b8a3e",
      "quadrantCode": "FOCUS_PROMOTION",
      "quadrantName": "집중 홍보 구간",
      "rawX": 0.6,
      "rawY": 0.52414,
      "xDisplayText": "+0.6%p",
      "yDisplayText": "+0.5%p",
      "unit": {
        "xUnitCode": "PERCENT_POINT",
        "yUnitCode": "PERCENT_POINT"
      }
    }
  ]
}
```

## 좌표 정규화(그래프 배치)

`StrengthWeaknessMatrix`는 `left/top`를 `%`로 사용한다.

- X 축: 중앙(50)이 0, 우측(100)이 +최대, 좌측(0)이 -최대
- Y 축: CSS `top` 기준이라 위쪽이 값이 작아야 하므로 “반전” 적용

정규화:

\[
maxAbsX = \max(|x\_value\_num|),\ \ maxAbsY = \max(|y\_value\_num|)
\]

\[
xPct = clamp(50 + (x/maxAbsX)\*50, 0, 100)
\]

\[
yPct = clamp(50 - (y/maxAbsY)\*50, 0, 100)
\]

## 구현 단계

### Backend

- `backend/app/routes/overview.py` 추가
  - asyncpg 파라미터 바인딩으로 SQL 실행(문자열 조립 최소화)
  - 결과 rows로 `maxAbsX/maxAbsY` 계산 후 `x,y`를 0~100으로 정규화
- `backend/app/schemas.py`에 응답 모델 추가
- `backend/app/routes/__init__.py`에 `overview` export 추가
- `backend/app/main.py`에서 `include_router(overview.router)` 추가

### Frontend

- `frontend/src/services/api.js`에 `getOverviewMatrixPoints(params)` 추가
- `StrengthWeaknessMatrix`가 DB의 `colorHex`(hex)도 렌더링할 수 있게 수정
  - 기존 샘플(`color: "primary"`)도 그대로 동작하도록 하위호환 유지
- `MainPage.jsx`에서 샘플 데이터 대신 API를 호출해 `matrix` 상태에 주입
  - 호출 실패 시 샘플 `matrix`로 fallback
  - 기본 학교명 `충남대학교`를 임시로 하드코딩

## 향후 확장(유저 컨텍스트 연동)

- 프론트: 로그인/유저 프로필에서 `schl_nm` 획득 → API 파라미터로 전달
- 백엔드: 인증/인가가 도입되면, `schl_nm`을 파라미터로 받지 않고 “현재 유저의 학교”로 강제할 수 있음

