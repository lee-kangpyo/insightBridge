## Purpose

Scholar Metric UI(대시보드/404) MVP의 화면 구조, 라우팅, 디자인 토큰, 반응형 최소 기준을 정의한다.

## Requirements

### Requirement: Scholar Metric dashboard shell

The frontend SHALL render a dashboard view that matches the structural layout of `docs/scholar_metric/code.html`: fixed left sidebar (brand, primary navigation items, footer actions), a main column with top app bar (title, horizontal tabs, notifications and settings affordances, institutional login control, user avatar area), and a scrollable dashboard body.

#### Scenario: Default dashboard route

- **WHEN** the user navigates to the route designated for the Scholar Metric dashboard (default SHALL be `/` unless a superseding routing change explicitly documents a different path)
- **THEN** the application displays the dashboard shell with sidebar navigation labels consistent with the reference (e.g. 개요, 재정, 등록, 학생 성공, 교수진)
- **AND** the top bar SHALL include tab labels consistent with the reference (e.g. 대시보드, 분석, 보고서, 비교)
- **AND** the main body SHALL include a page header with institutional performance title, a filter/control cluster (search-style institution field, metric select, benchmark checkboxes), a primary heatmap card, a right-hand summary and insights column, and a tertiary row of three KPI-style tiles

### Requirement: Dashboard MVP content and data

The dashboard SHALL use mock or static data for MVP to represent one sample institution (e.g. 건국대학교) and placeholder metrics, without requiring backend APIs.

#### Scenario: Heatmap and summary reflect mock data

- **WHEN** the dashboard view is displayed
- **THEN** the heatmap region SHALL show discrete cells and at least one highlighted rank marker per metric column as in the reference
- **AND** the institution summary panel SHALL show rank and comparison rows with static values
- **AND** narrative text in the strategic insights area SHALL render as readable rich text without raw markdown delimiter characters visible to the user

### Requirement: Primary actions are non-destructive placeholders

Download and report buttons SHALL be visible and styled per reference but MAY no-op or log in MVP; they MUST NOT fail the application or navigate away unexpectedly.

#### Scenario: Sidebar annual report button

- **WHEN** the user activates the sidebar “연간 보고서 다운로드” control
- **THEN** the application SHALL not throw an unhandled error
- **AND** MAY show a no-op behavior (e.g. disabled state with title, or console-only stub) until export is implemented

### Requirement: Scholar Metric styled not-found page

For unknown routes, the application SHALL render a not-found page aligned with `docs/404/code.html`: layered “404” display, Korean title and description, primary CTA to home (`/`), secondary CTA to support (`/support` or equivalent documented stub), and footer links area consistent with the reference pattern.

#### Scenario: Unmatched path shows branded 404

- **WHEN** the user navigates to a path not defined in the router
- **THEN** the application displays the not-found view
- **AND** the application SHALL NOT automatically redirect to `/` solely because the path is unknown
- **AND** the user SHALL be able to navigate to `/` via an explicit control on the not-found view

### Requirement: Design tokens and typography

The UI SHALL apply the color palette and typography described in `docs/scholar_metric/DESIGN.md` and encoded in the reference HTML Tailwind theme (primary navy, secondary green, surface tokens, Manrope for headlines, Inter for body). Where reference HTML and DESIGN.md conflict on borders or shadows, the implementation SHALL follow the reference HTML for MVP visual parity unless a follow-up change adopts stricter DESIGN.md rules.

#### Scenario: Fonts load for dashboard and 404

- **WHEN** either the dashboard or not-found view is displayed
- **THEN** headline elements use the display/headline family (Manrope or configured equivalent)
- **AND** body and navigation text use Inter or configured equivalent

### Requirement: Responsive behavior minimum

The dashboard and not-found layouts SHALL remain usable on narrow viewports: sidebar MAY collapse or become off-canvas per implementation, and primary content SHALL not overflow horizontally without scroll containment.

#### Scenario: Narrow viewport

- **WHEN** the viewport width is below the desktop breakpoint used in the reference
- **THEN** the layout SHALL avoid permanent horizontal overflow of the main dashboard grid beyond intentional scroll regions
- **AND** the not-found page SHALL keep CTAs reachable without horizontal clipping
