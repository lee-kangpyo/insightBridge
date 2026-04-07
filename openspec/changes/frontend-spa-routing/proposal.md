## Why

메인 URL(`/`)에서 곧바로 기존 질의 UI가 열리면 새 랜딩·온보딩을 넣기 어렵고, 인사이트 기능은 별도 경로로 분리해 두는 편이 낫다. 클라이언트 사이드에서 경로별로 화면을 나누려면 라우터가 필요하다.

## What Changes

- `react-router-dom` 의존성 추가(React 19 호환 최신 v6 계열).
- 루트 경로 `/`: "Hello World"만 표시( `/insights`로 가는 링크는 넣지 않음).
- `/insights`: 기존 `QueryPage`(질의·차트) UI를 그대로 마운트.
- 정의되지 않은 경로: 전용 404 화면(메인으로 자동 리다이렉트하지 않음).
- 개발은 Vite 기본 동작으로 충분; 프로덕션 배포 시 SPA용 `index.html` 폴백은 별도 인프라 문서/설계에 명시.

## Capabilities

### New Capabilities

- `frontend-routing`: Vite React 앱의 URL 경로와 화면 매핑, 알 수 없는 경로에 대한 404 동작.

### Modified Capabilities

- (없음 — `openspec/specs/`에 프론트 라우팅 스펙이 없으며, 본 변경은 신규 동작 정의.)

## Impact

- `frontend/package.json`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, 신규 페이지/레이아웃 컴포넌트(Hello World, NotFound).
- `frontend/src/pages/QueryPage.jsx`는 경로만 `/insights`로 옮겨 렌더링; API 클라이언트(`api.js`)는 경로와 무관하게 동작해야 함.
- 배포 환경(정적 호스팅·리버스 프록시)에서 클라이언트 라우트 새로고침 시 `index.html` 제공 여부는 운영 설정에 따름.
