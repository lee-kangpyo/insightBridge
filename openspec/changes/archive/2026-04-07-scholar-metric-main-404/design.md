## Context

- 프론트는 `frontend/`의 Vite + React 19 + `react-router-dom`이다.
- 시각·구조 레퍼런스는 `docs/scholar_metric/DESIGN.md`, `docs/scholar_metric/code.html`(메인), `docs/404/code.html`(404)이다.
- 진행 중일 수 있는 `frontend-spa-routing` 변경은 루트에 “Hello World”를 둔다; 본 변경은 루트(또는 합의된 경로)에 Scholar Metric 대시보드 셸을 두는 방향과 정렬이 필요하다.

## Goals / Non-Goals

**Goals:**

- 레퍼런스 HTML과 동등한 정보 구조·브랜딩(사이드바, 상단 바, 대시보드 본문, 404 중앙 콘텐츠·CTA)을 React 컴포넌트로 분해해 구현 가능하게 한다.
- 디자인 토큰(색, 반경, Manrope/Inter, Material Symbols)을 코드베이스에서 재사용 가능한 형태로 둔다.
- 알 수 없는 경로에 대해 전용 404 뷰를 유지하고, 자동으로 `/`로 리다이렉트하지 않는다(기존 라우팅 의도와 일치).

**Non-Goals:**

- 실제 기관·순위 API 연동, PDF/보고서 생성, 인증·세션.
- 다크 모드 전 범위 완성(레퍼런스의 `dark:` 클래스는 선택 적용으로 두어도 됨).
- `DESIGN.md`와 레퍼런스 HTML이 충돌하는 세부(테두리 유무 등)를 이 설계에서 이론적으로 완전 통일하지 않음 — 스펙에서 “레퍼런스 HTML 우선”으로 둔다.

## Decisions

1. **스타일링: Tailwind CSS v4 또는 v3 + PostCSS**  
   - *이유:* 레퍼런스가 Tailwind 유틸 기반이며, 토큰을 `theme.extend`로 옮기기 쉽다.  
   - *대안:* CSS Modules + CSS 변수만 사용 — 유지보수는 단순하나 마크업 이식 비용이 크다.

2. **컴포넌트 경계**  
   - 레이아웃: `DashboardLayout`(사이드바 + 메인), `NotFoundLayout` 또는 공통 `AppHeader`/`AppFooter`만 404에서 재사용.  
   - 기능 단위: `Sidebar`, `TopBar`, `DashboardFilters`, `RankingHeatmapCard`, `InstitutionSummaryPanel`, `StrategicInsightsCard`, `KpiTile` 등.  
   - *이유:* MVP 이후 API·상태 주입 지점을 명확히 한다.

3. **루트 경로**  
   - *권장:* `/`에 대시보드 MVP를 마운트하고, 기존 질의 UI는 `/insights`에 유지(이미 라우팅 변경이 있다면).  
   - *대안:* `/dashboard`만 두고 `/`는 랜딩 리다이렉트 — 추가 클릭이 생겨 MVP 검증에 불리할 수 있다.

4. **목 데이터**  
   - TypeScript가 도입되면 `types/institution.ts` 등 소규모 타입 + `fixtures/konkukDashboard.ts` 형태의 상수; JS만 쓰면 동일 구조의 `.js` 픽스처.

5. **외부 이미지**  
   - 프로필 등은 MVP에서 이니셜 아바타 또는 로컬 placeholder로 대체해 외부 URL 의존을 제거한다.

## Risks / Trade-offs

- [Risk] `frontend-spa-routing`과 루트 요구가 충돌 → [Mitigation] 병합 순서 정하거나 한 변경의 `proposal`/`tasks`에 “루트 화면 교체”를 명시적으로 포함.
- [Risk] 히트맵을 순수 div 그리드로 두면 유지보수가 어려움 → [Mitigation] MVP는 레퍼런스와 동일한 정적 그리드; 이후 ECharts 등으로 교체 시 컴포넌트 경계만 유지.
- [Risk] 레퍼런스 HTML의 `**` 마크다운 잔여 → [Mitigation] 구현 시 실제 `<strong>` 또는 문장 분리.

## Migration Plan

1. Tailwind 및 폰트 설정 추가 → 빌드 확인.  
2. 레이아웃·페이지 컴포넌트 추가 후 라우터에 연결.  
3. 기존 `/`가 Hello World인 경우 제거 또는 대시보드로 교체.  
4. 롤백: 라우트와 신규 컴포넌트 제거, 이전 `App` 구조 복원.

## Open Questions

- `/support` 페이지를 MVP에서 빈 스텁으로 둘지, 404의 링크만 `mailto:`로 할지.
- 상단 탭(대시보드·분석·…)과 사이드 항목(개요·재정·…)의 네비게이션을 실제 경로로 나눌지, MVP에서는 `href="#"` 유지할지.
