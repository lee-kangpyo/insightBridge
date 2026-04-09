# InsightBridge MVP 확장 구현 Plan (큰 그림)

## 목표

- 각 화면/위젯을 **DB 기반 실데이터**로 치환한다.
- 작업 단위를 “위젯 1개 = API 1개(또는 소수) + 프론트 연결 1개”로 쪼개서, 반복 생산성을 극대화한다.
- 현재는 “충남대학교”를 임시 기본값으로 하되, 추후 **유저 컨텍스트(학교 정보)**로 자연스럽게 대체할 수 있게 구조를 잡는다.

## 핵심 원칙(반복 규칙)

- 프론트는 렌더링에 집중하고, 데이터 가공(정규화/집계/정렬)은 가능한 백엔드에서 수행한다.
- SQL은 asyncpg 파라미터 바인딩만 사용한다(문자열 조립 최소화).
- 응답 JSON은 **컴포넌트가 바로 소비 가능한 shape**로 만든다.
- “API 실패 시 fallback(샘플/빈 상태)”를 프론트에 넣어 화면이 깨지지 않게 한다.

## 구현 대상 범주(위젯 타입별 템플릿)

아래 각 타입은 “필요 데이터 → API 설계 → 프론트 매핑”을 동일 패턴으로 구현한다.

### A. KPI 카드(큰 KPI/작은 KPI)

- **필요 데이터**
  - 지표명/값/연도
  - 비교(지역/전국) 값 + 상태(positive/negative/neutral 등)
  - 색상(accent key 또는 hex)
- **API**
  - `GET /api/overview/kpis`
  - params: `screen_base_year`, `schl_nm`
- **프론트 매핑**
  - `sampleData.kpis.large/small`과 동일 shape로 내려줘서 교체 비용 최소화

### B. 강점/약점 매트릭스(사분면 산점도)

- 이미 구현됨
- 문서:
  - `PLAN_overview_matrix.md`
  - `ARCHITECTURE_overview_matrix.md`

### C. 인사이트 패널(텍스트 + 액션 리스트)

- **필요 데이터**
  - strengths/risks/actions(문장 + bullet)
  - 근거 지표/출처(있으면)
- **API**
  - `GET /api/overview/insights`
  - params: `screen_base_year`, `schl_nm`
- **프론트 매핑**
  - `sampleData.insights` shape로 반환

### D. 리스크/강점 테이블

- 구현됨
- **필요 데이터**
  - indicator, regionalStatus, nationalStatus, overallStatus
- **API**
  - `GET /api/overview/risk-table`
  - params: `screen_base_year`, `schl_nm`

### E. 진행률/목표 달성(ProgressMetricGrid)

- **필요 데이터**
  - label, current, target, percentage, color
- **API**
  - `GET /api/overview/progress-metrics`
  - params: `screen_base_year`, `schl_nm`

## 백엔드 표준 아키텍처(추가 기능 공통 골격)

### 파일 위치 규칙

- 라우트: `backend/app/routes/<feature>.py`
- 스키마: `backend/app/schemas.py`
- (선택) 서비스 계층: `backend/app/services/<feature>.py`
  - 쿼리/집계가 커지면 routes에서 분리
- 앱 등록: `backend/app/main.py`, `backend/app/routes/__init__.py`

### API 설계 규칙

```text
For each widget:
  1) 응답 모델(Pydantic)을 먼저 정의한다.
  2) 라우트에서 query params 검증(Query(..., ge/le 등))을 걸어준다.
  3) DB 조회는 asyncpg bind params로만 수행한다.
  4) rows -> 응답 shape 변환(정렬/정규화/라벨링 포함).
  5) 0건이면 "빈 shape"를 반환해 프론트가 깨지지 않게 한다.
```

### 공통 파라미터(추천)

- `screen_code`, `screen_ver`, `screen_base_year`
- `schl_nm`(현재는 프론트에서 기본값 하드코딩 → 추후 유저 컨텍스트로 교체)
- 필요시 `metric_year`, `metric_code`, `region` 등

## 프론트 표준 아키텍처(추가 기능 공통 골격)

### 파일 위치 규칙

- API 클라이언트: `frontend/src/services/api.js`에 공통 axios 인스턴스 사용
- 페이지별 데이터 로딩: `frontend/src/pages/<Page>.jsx`
- UI 컴포넌트: `frontend/src/components/**`

### 프론트 데이터 로딩 규칙

```text
In page component:
  state = sampleData (fallback)
  useEffect:
    call API
    if success -> setState(apiData)
    else -> keep fallback
```

### shape 우선 전략

- 샘플 JSON(`frontend/src/data/*.json`)의 shape를 “UI 계약”으로 보고,
  백엔드 응답을 최대한 같은 구조로 맞춘다.

## 유저 컨텍스트(학교) 연동 로드맵

### 현재(임시)

- 프론트에서 `schl_nm: '충남대학교'` 하드코딩으로 API 호출

### 다음 단계(권장)

- 유저 정보(학교명 또는 학교코드)를 전역 상태로 관리
  - 예: `UserContext`, 또는 라우팅 진입 시 한번 로드
- API 호출 시 `schl_nm`을 전역 유저 정보에서 가져오게 변경

### 인증 도입 후(선택)

- 백엔드가 토큰에서 유저를 식별하고, 서버에서 학교를 강제
  - 프론트는 `schl_nm` 파라미터를 보내지 않아도 됨

## 테스트/검증 체크리스트(위젯 1개 추가 시 매번)

- 백엔드
  - 로컬에서 `uv run uvicorn app.main:app --reload --port 8000`
  - curl/requests로 API 200 확인
  - 0건/에러 케이스에서 응답 shape 유지 확인
- 프론트
  - Network 탭에서 해당 API 호출/응답 확인
  - 화면이 샘플에서 실데이터로 바뀌었는지 확인
  - 색상/라벨/정렬이 의도대로인지 확인

## 추천 작업 순서(반복 루프)

```text
Repeat until all widgets are DB-backed:
  1) 위젯 1개 선택(예: KPI large)
  2) 필요한 DB 테이블/컬럼 확정 + 샘플 shape 확정
  3) 백엔드: schema -> route -> DB query -> 응답 변환
  4) 프론트: service 함수 추가 -> 페이지에서 호출 -> 컴포넌트 연결
  5) 로컬 실행 + 네트워크/화면 검증
  6) docs/에 해당 기능 문서(PLAN/ARCHITECTURE) 누적
```
