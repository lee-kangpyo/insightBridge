# Overview Matrix 아키텍처 정리 (AI 참고용)

## 문제 도메인

`tq_overview_matrix_point`는 “2차원 비교 지표(매트릭스/사분면)” 데이터를 저장한다.

- X축: `x_value_num` (+ 표시 문자열 `x_display_text`, 단위 `x_unit_code`)
- Y축: `y_value_num` (+ 표시 문자열 `y_display_text`, 단위 `y_unit_code`)
- 사분면/분류: `quadrant_code`, `quadrant_name`, `comparison_direction_code`
- 표현: `point_color_hex`
- 키: 화면(`screen_code/screen_ver/screen_base_year`) + 학교(`schl_nm`) + 지표(`metric_code`) = 1점

## 시스템 구성

### Backend (FastAPI)

- 앱 엔트리: `backend/app/main.py`
- 라우트: `backend/app/routes/*`
- DB 연결: `backend/app/database.py`
  - `asyncpg.create_pool(settings.database_url)`
  - 요청마다 `pool.acquire()`로 커넥션 획득

### Frontend (React)

- API 클라이언트: `frontend/src/services/api.js` (axios baseURL: `VITE_API_URL`)
- 메인 페이지: `frontend/src/pages/MainPage.jsx`
- 매트릭스 UI: `frontend/src/components/main/StrengthWeaknessMatrix.jsx`

## 데이터 플로우(End-to-End)

1) Frontend `MainPage`에서
   - (현재 임시) `schl_nm="충남대학교"` 및 `screen_base_year` 등을 파라미터로
   - `GET /api/overview/matrix-points` 호출

2) Backend 라우트에서
   - `tq_overview_matrix_point`를 조건으로 조회
   - 결과 rows를 포인트 배열로 변환
   - `x_value_num/y_value_num`을 “화면 좌표(0~100%)”로 정규화

3) Frontend `StrengthWeaknessMatrix`에서
   - `points[].x/y`로 `style={{ left: `${x}%`, top: `${y}%` }}` 배치
   - 색상은 DB의 `colorHex`를 우선 적용(없으면 기존 tailwind class 키 사용)

## 설계 의도 / 트레이드오프

### 왜 정규화를 백엔드에서 하나?

- 현재 UI는 `%` 기반 절대 배치로 구현되어 있어, 프론트에서 “값 범위 추정/정규화” 로직이 커지면 UI 컴포넌트가 데이터 처리까지 떠안게 된다.
- 백엔드에서 정규화를 고정하면:
  - 프론트는 렌더링에 집중
  - 동일 기준(화면/학교/연도)에서 항상 동일한 배치 규칙 유지

### numeric → JS number

- `numeric(25,6)`는 매우 큰 값/정밀도를 가질 수 있다.
- 본 매트릭스는 시각화 목적이므로 “정규화 및 표시” 중심.
  - 원본 값은 `rawX/rawY`로 함께 내려주되, 프론트는 표시/툴팁 중심으로 사용한다.
  - 정밀 계산이 필요해지면 문자열로 내려서(예: `"0.524140"`) 처리하거나, 계산을 백엔드/DB로 이동한다.

## 확장 전략

### 멀티 학교 지원

- 동일 화면에서 여러 학교 점을 찍으려면:
  - `schl_nm` 필터를 제거하거나 리스트 파라미터로 확장
  - 응답에서 `name`/tooltip에 학교명을 포함해 구분

### 유저 컨텍스트(로그인) 연동

- 현재: 프론트에서 `schl_nm`을 임시 하드코딩
- 이후:
  - 유저 프로필에서 학교명(또는 학교 코드→학교명 매핑)을 가져와 호출
  - 인증이 도입되면 백엔드에서 유저 컨텍스트 기반으로 학교를 강제할 수 있음

## 운영/품질 체크리스트

- SQL은 반드시 asyncpg 파라미터 바인딩 사용(인젝션 방지)
- 결과 0건일 때도 UI가 깨지지 않는 응답 shape 유지(빈 points)
- 색상(hex) 렌더링 하위호환(샘플 데이터의 `color` 키 유지)

