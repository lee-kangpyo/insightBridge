## 1. Tooling and tokens

- [x] 1.1 Add Tailwind CSS (and PostCSS if required) to `frontend/`, wire Vite content paths for `src/**/*`
- [x] 1.2 Port Scholar Metric color/radius/font tokens from reference HTML into `tailwind.config` (or v4 `@theme`) and add Manrope, Inter, Material Symbols (link or npm)
- [x] 1.3 Run `npm run build` and fix any style or import errors

## 2. Layout and routing

- [x] 2.1 Add `DashboardLayout` with fixed sidebar (`w-64`) and main area (`ml-64` or flex equivalent) matching reference structure
- [x] 2.2 Register dashboard route at `/` (or agreed path) and ensure `/insights` or existing routes remain intact after coordinating with `frontend-spa-routing`
- [x] 2.3 Replace or remove conflicting root “Hello World” view when dashboard becomes the home screen
- [x] 2.4 Wire catch-all or `path="*"` to Scholar Metric styled `NotFoundPage` without auto-redirect to `/`

## 3. Dashboard components

- [x] 3.1 Implement `Sidebar` (brand block, nav items, gradient CTA stub, footer links)
- [x] 3.2 Implement `TopBar` (title, tabs, icon buttons, 기관 로그인, avatar placeholder without external URL dependency)
- [x] 3.3 Implement `DashboardPageHeader` and `DashboardFilters` (readonly search field, select, checkboxes)
- [x] 3.4 Implement `RankingHeatmapCard` with static grid and highlighted cells per reference
- [x] 3.5 Implement `InstitutionSummaryPanel` and primary action button stub
- [x] 3.6 Implement `StrategicInsightsCard` with bold phrases via JSX (no visible `**`)
- [x] 3.7 Implement tertiary `KpiTile` row (three cards with hover styles)

## 4. 404 page

- [x] 4.1 Implement `NotFoundPage` with nav, layered 404 typography, Korean copy, home and support CTAs (`/` and `/support` or stub)
- [x] 4.2 Add footer block consistent with reference; link targets may be `#` until legal pages exist

## 5. Verification

- [x] 5.1 Manually verify dashboard and 404 at desktop and narrow viewport; no unhandled errors on stub buttons
- [x] 5.2 Run `npm run lint` and resolve new issues in touched files
