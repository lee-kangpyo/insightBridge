# Frontend Routing Spec

## Purpose

Defines client-side routing behavior for the frontend application, enabling distinct URL paths without full page reloads and providing proper handling of known and unknown routes.

## Requirements

### Requirement: Client-side URL routes

The frontend application SHALL expose distinct URL paths using client-side routing such that the browser address bar reflects the current screen without a full page reload for in-app navigation.

#### Scenario: Root path shows placeholder home

- **WHEN** the user navigates to `/`
- **THEN** the application displays a minimal home view containing the text "Hello World" (or equivalent visible greeting)
- **AND** the home view SHALL NOT include a link or button whose sole purpose is navigating to `/insights`

#### Scenario: Insights path shows query experience

- **WHEN** the user navigates to `/insights`
- **THEN** the application displays the existing natural-language query and chart experience (current `QueryPage` behavior)
- **AND** API calls used by that experience SHALL continue to function regardless of the URL path

### Requirement: Unknown paths show not-found UI

The application SHALL render a dedicated not-found view for any path that is not explicitly defined by the router.

#### Scenario: Unmatched path

- **WHEN** the user navigates to a path that is not `/` or `/insights`
- **THEN** the application displays a not-found view (404)
- **AND** the application SHALL NOT automatically redirect the user to `/` solely because the path is unknown
