## Why

문서(`docs/scholar_metric`, `docs/404`)에 정의된 Scholar Metric 브랜드·대시보드·404 레이아웃을 실제 Vite React 앱에 반영할 필요가 있다. MVP 단계에서 정적·목(mock) 데이터로도 화면 셸과 내비게이션 경험을 검증하려면, 컴포넌트 단위 설계와 요구사항을 스펙으로 고정하는 것이 이후 API 연동과 충돌을 줄인다.

## What Changes

- 메인(대시보드) 화면: `docs/scholar_metric/code.html` 및 `DESIGN.md`에 맞는 레이아웃(사이드바, 상단 바, 필터 영역, 히트맵 카드, 기관 요약·인사이트·하단 KPI 타일). MVP는 목 데이터·클릭 플레이스홀더 허용.
- 404 화면: `docs/404/code.html`에 맞는 중앙 메시지, 홈·지원 CTA, 상단/푸터 셸(기존 라우팅 스펙과 충돌 없이 “미매칭 경로 시 전용 뷰” 유지).
- 스타일: 레퍼런스와 동일한 색·타이포 토큰을 프로젝트에 반영(Tailwind 권장). `DESIGN.md`의 No-Line·CTA 그라데이션 등은 레퍼런스 HTML과 어긋나는 부분은 스펙에서 “레퍼런스 HTML 우선” 또는 “문서 우선” 중 하나로 명시.
- 라우팅: 루트 `/`에서 대시보드(또는 별도 `/dashboard`) 노출 방식을 설계·태스크에 명시. 진행 중인 `frontend-spa-routing` 변경과 병합 시 루트가 “Hello World”가 아닌 본 대시보드로 대체될 수 있음(**BREAKING** 해당 변경과 순서 조율 시에만).

## Capabilities

### New Capabilities

- `scholar-metric-ui`: Scholar Metric 메인 대시보드 MVP UI, 404 페이지 UI, 공통 레이아웃·디자인 토큰·React 컴포넌트 구조 및 접근성·반응형 최소 기준.

### Modified Capabilities

- (없음 — `openspec/specs/` 기준 기존 프론트 UI 스펙 없음. `openspec/changes/frontend-spa-routing`의 루트 화면 문구 요구와 병합 시 해당 변경 쪽 요구를 조정해야 할 수 있음.)

## Impact

- `frontend/` 소스: 신규 페이지·레이아웃·컴포넌트, 스타일 설정(Tailwind 등), 정적 자산·폰트 로딩.
- `react-router-dom` 기존 라우트 정의와 경로 추가·루트 콘텐츠 교체 가능.
- 외부 이미지(프로필 등)는 MVP에서 플레이스홀더 또는 로컬 에셋으로 대체 가능.
