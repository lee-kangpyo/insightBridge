## 1. Dependencies and entry

- [x] 1.1 Add `react-router-dom` to `frontend/package.json` (latest v6 compatible with React 19) and install
- [x] 1.2 Wrap the app root in `BrowserRouter` in `frontend/src/main.jsx`

## 2. Routes and pages

- [x] 2.1 Add `HomePage` (or inline) showing "Hello World" only — no link to `/insights`
- [x] 2.2 Add `NotFoundPage` for unknown routes (no auto-redirect to `/`)
- [x] 2.3 Update `App.jsx`: `Routes` with `/` → home, `/insights` → `QueryPage`, `*` → `NotFoundPage`

## 3. Verification

- [x] 3.1 Manual: `npm run dev` — `/` shows Hello World; `/insights` shows query UI; `/anything` shows 404
- [x] 3.2 Confirm `QueryPage` still calls API successfully from `/insights` (network tab or smoke query)
- [x] 3.3 Document SPA `index.html` fallback for production deploy (e.g. one line in `frontend/README.md` if file exists, or project root deploy notes — only if project already documents deploy)
