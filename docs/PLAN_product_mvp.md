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

## 입시/충원 탭(테마탭 공통 스냅샷 기반)

### 목표

- “입시/충원” 탭의 상단 KPI/상세 KPI/차트/설명 텍스트/출처 정보를 **스냅샷 테이블 기반 실데이터**로 렌더링한다.
- 기존 원칙대로 “위젯 1개 = API 1개 + 프론트 연결 1개”로 반복 구현한다.

### 사용 테이블(입시/충원 탭에서 사용될 스냅샷)

- KPI 카드(상단): `public.tq_screen_metric_card`
- KPI 상세 그리드: `public.tq_screen_detail_grid`
- 차트 블록 메타: `public.tq_screen_chart_block`
- 차트 블록 아이템: `public.tq_screen_chart_item`
- 텍스트 블록 헤더: `public.tq_screen_text_block`
- 텍스트 블록 라인: `public.tq_screen_text_line`
- 출처/원천 참조 프리뷰: `public.tq_screen_source_ref`

### 공통 파라미터(권장)

- `screen_code`, `screen_ver`, `screen_base_year`, `schl_nm`
- 권장 기본값(문서 표준):
  - `screen_ver`: `v0.1`
  - `screen_code`: (예) `admission_fill`  (입시/충원 탭 식별 코드)

### 위젯별 API 설계(입시/충원)

아래는 “입시/충원 탭”에 필요한 데이터 블록을 공통 스냅샷 테이블에서 읽어오는 API 템플릿이다.
프론트는 화면 코드(`screen_code`)만 바꿔서 동일한 컴포넌트 계약(shape)으로 소비할 수 있게, 백엔드가 정렬/정규화까지 책임진다.

#### 1) 상단 KPI 카드

- **소스 테이블**: `tq_screen_metric_card`
- **정렬 기준**: `display_order ASC, metric_code ASC`
- **주요 컬럼(표시/비교/스타일)**:
  - `metric_name`, `metric_year`
  - `my_value_display`, `region_avg_display`, `national_avg_display`
  - `comparison_direction_code`(HIGHER_BETTER/LOWER_BETTER)
  - `aux_label`, `aux_display_text`
  - `accent_color_hex`
  - `source_table_name`, `source_column_expr`(선택 노출: 근거/출처)
- **API**
  - `GET /api/theme/kpi-cards`
  - params: `screen_code`, `screen_ver`, `screen_base_year`, `schl_nm`
- **백엔드 처리 의사코드(상세)**

```text
function getThemeKpiCards(screen_code, screen_ver, screen_base_year, schl_nm):
  rows = SELECT * FROM tq_screen_metric_card
         WHERE screen_code=? AND screen_ver=? AND screen_base_year=? AND schl_nm=?
         ORDER BY display_order, metric_code

  if rows is empty:
    return { title: "", items: [] }  # 항상 동일 shape

  items = []
  for each row in rows:
    item = {
      metricCode: row.metric_code,
      title: row.metric_name,
      year: row.metric_year,
      myValue: row.my_value_display,
      regionAvg: row.region_avg_display,
      nationalAvg: row.national_avg_display,
      comparisonDirectionCode: row.comparison_direction_code,
      aux: { label: row.aux_label, text: row.aux_display_text },
      accentColorHex: row.accent_color_hex,
      source: { table: row.source_table_name, expr: row.source_column_expr }
    }
    items.append(item)

  return { title: "입시/충원 핵심 지표", items: items }
```

#### 2) KPI 상세 그리드

- **소스 테이블**: `tq_screen_detail_grid`
- **정렬 기준**: `display_order ASC, metric_code ASC`
- **주요 컬럼(표시/비교/스타일/근거)**:
  - `metric_name`, `metric_year`
  - `my_value_display`, `region_avg_display`, `national_avg_display`
  - `comparison_direction_code`
  - `aux_label`, `aux_display_text`
  - `accent_color_hex`
  - `source_table_name`, `source_column_expr`
- **API**
  - `GET /api/theme/detail-grid`
  - params: `screen_code`, `screen_ver`, `screen_base_year`, `schl_nm`

#### 3) 차트 블록(막대/리스트 등)

- **소스 테이블**
  - 블록 메타: `tq_screen_chart_block`
  - 블록 아이템: `tq_screen_chart_item`
- **블록 정렬 기준**: `chart_block.display_order ASC, block_code ASC`
- **아이템 정렬 기준**: `chart_item.item_order ASC`
- **블록 메타 주요 컬럼**
  - `block_code`, `block_title`, `block_subtitle`, `block_style`(bars/list), `display_order`
- **아이템 주요 컬럼**
  - `item_label`, `item_value_num`, `item_display_text`, `item_note_text`, `item_color_hex`
- **API**
  - `GET /api/theme/chart-blocks`
  - params: `screen_code`, `screen_ver`, `screen_base_year`, `schl_nm`
- **백엔드 처리 의사코드(상세)**

```text
function getThemeChartBlocks(screen_code, screen_ver, screen_base_year, schl_nm):
  blocks = SELECT * FROM tq_screen_chart_block
           WHERE filter...
           ORDER BY display_order, block_code

  items = SELECT * FROM tq_screen_chart_item
          WHERE filter...
          ORDER BY block_code, item_order

  itemsByBlock = group items by block_code
  result = []
  for each block in blocks:
    result.append({
      blockCode: block.block_code,
      title: block.block_title,
      subtitle: block.block_subtitle,
      style: block.block_style,
      items: map(itemsByBlock[block.block_code] or [])
    })
  return { blocks: result }
```

#### 4) 설명/인사이트 텍스트 블록

- **소스 테이블**
  - 헤더: `tq_screen_text_block`
  - 라인: `tq_screen_text_line`
- **정렬 기준**
  - 블록: `display_order ASC, block_code ASC`
  - 라인: `line_no ASC`
- **API**
  - `GET /api/theme/text-blocks`
  - params: `screen_code`, `screen_ver`, `screen_base_year`, `schl_nm`
- **권장 응답**
  - `{ blocks: [{ blockCode, areaName, title, lines: [{ role, text }] }] }`

#### 5) 출처/원천 참조 프리뷰

- **소스 테이블**: `tq_screen_source_ref`
- **정렬 기준**: `ref_order ASC`
- **API**
  - `GET /api/theme/source-refs`
  - params: `screen_code`, `screen_ver`, `screen_base_year`, `schl_nm`
- **권장 응답**
  - `{ refs: [{ tableName, columnExpr, note }] }`

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
