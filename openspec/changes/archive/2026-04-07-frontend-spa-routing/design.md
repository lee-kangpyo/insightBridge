## Context

`frontend`는 Vite + React 단일 진입(`App.jsx`가 `QueryPage`만 렌더). URL 경로 개념이 없어 루트만 제공된다. 배포 시 정적 파일은 `index.html` 단일 엔트리이며, 클라이언트 라우터는 History API로 경로를 해석한다.

## Goals / Non-Goals

**Goals:**

- `react-router-dom`(v6, React 19 호환 최신)으로 `/`, `/insights`, catch-all 404를 선언적으로 매핑한다.
- 기존 질의 UI는 리팩터 최소화로 `/insights`에 연결한다.
- 알 수 없는 경로는 사용자에게 404 UI를 보여 주고 루트로 강제 이동시키지 않는다.

**Non-Goals:**

- Next.js/Remix 스타일 파일 시스템 라우팅.
- `/`에 `/insights` 링크·CTA 추가.
- 백엔드(FastAPI)에서 프론트 경로별 서버 사이드 렌더링.
- nginx/Caddy 등 구체 설정 파일을 레포에 반드시 포함하는 것(문서로만 안내 가능).

## Decisions

1. **라우터:** `react-router-dom` v6 `BrowserRouter` + `Routes`/`Route`. Hash 라우터는 URL 미관·딥링크 이슈로 채택하지 않음.
2. **엔트리:** `main.jsx`에서 `BrowserRouter`로 `App`을 감싼다.
3. **컴포넌트 분리:** `HomePage`(Hello World), `NotFoundPage`(404), 기존 `QueryPage`는 `path="/insights"`에 연결. 필요 시 얇은 `pages/` 레이아웃만 추가.
4. **404:** `path="*"`에 `NotFoundPage` 매핑. `Navigate to="/"` 사용하지 않음(합의).
5. **API:** `axios`/baseURL이 절대 경로 또는 `VITE_` 환경 변수 기반이면 경로 변경과 무관. 상대 경로가 잘못된 경우만 구현 시 점검.
6. **프로덕션 폴백:** HTTP 서버가 `/insights` 등에 대해 `index.html`을 반환해야 클라이언트 라우터가 동작한다. 이는 “모든 미지의 URL을 메인 콘텐츠로 보낸다”가 아니라 **정적 자산이 아닐 때 SPA 엔트리를 주는** 설정이다. 404 UX는 React의 `*` 라우트가 담당.

## Risks / Trade-offs

- **[Risk]** 배포 서버가 SPA 폴백 없이 설정되면 `/insights` 직접 접속·새로고침 시 HTTP 404.  
  **→ Mitigation:** README 또는 배포 체크리스트에 `try_files`/`fallback` 예시 한 줄 명시.
- **[Risk]** 향후 베이스 경로(`base`)를 쓰면 `BrowserRouter`에 `basename` 필요.  
  **→ Mitigation:** 현재는 루트 배포 가정; 서브패스 배포 시 설계 보강.

## Migration Plan

1. 의존성 추가 후 라우트 구성.
2. 로컬에서 `/`, `/insights`, 임의 경로(`/nope`) 수동 확인.
3. 빌드 산출물을 기존과 동일한 방식으로 배포; 인프라 담당이 폴백 적용.

## Open Questions

- 없음(배포 스택이 정해지면 폴백 스니펫만 해당 스택에 맞게 보강).
