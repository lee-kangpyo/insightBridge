# Design System: Academic Intelligence

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Scholarly Architect."** It envisions a digital environment that balances the weight of academic tradition with the precision of modern data science. Unlike standard dashboards that rely on heavy lines and "boxed-in" widgets, this system uses expansive white space, intentional asymmetry, and tonal layering to create an editorial feel. 

The goal is to move away from "administrative software" and toward a "curated intelligence platform." By utilizing high-contrast typography scales and subtle shifts in surface luminance, we ensure the dashboard feels premium, authoritative, and tech-forward.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, authoritative navy (`primary: #002045`) and a sophisticated scholarly green (`secondary: #2c694e`). These colors are used sparingly for emphasis, while the majority of the UI breathes through a sophisticated neutral scale.

### The "No-Line" Rule
To achieve a high-end editorial look, **1px solid borders are prohibited for sectioning.** Traditional boundaries feel cluttered. Instead:
- **Tonal Transitions:** Define sections by shifting from `surface` (#f7f9fb) to `surface_container_low` (#f2f4f6).
- **Negative Space:** Use the spacing scale to create clear separation between data visualizations and navigation elements.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use Material-style surface tokens to define importance:
1.  **The Base:** `surface` (#f7f9fb) is the canvas.
2.  **The Stage:** `surface_container_lowest` (#ffffff) is used for primary cards and data canvases to make them "pop" against the off-white base.
3.  **The Inset:** Use `surface_container_high` (#e6e8ea) for utility bars or secondary sidebar elements to create a grounded feel.

### Glass & Signature Textures
For floating elements (like hover tooltips or mobile navigation), employ **Glassmorphism**. Use semi-transparent variants of `surface` with a 12px-20px backdrop blur. 
- **CTA Soul:** Main call-to-actions should not be flat. Apply a subtle linear gradient from `primary` (#002045) to `primary_container` (#1a365d) to add depth and "soul" to interactive elements.

## 3. Typography: The Editorial Engine
The system uses a dual-font strategy to balance character with readability.

- **The Voice (Display & Headlines):** `manrope` is our display face. Its geometric yet open curves feel "tech-forward." Use `display-lg` (3.5rem) for hero data points and `headline-sm` (1.5rem) for section titles.
- **The Information (Body & Labels):** `inter` is the workhorse. It is used for all functional data, body copy, and navigation labels. Its high legibility ensures that complex university data remains accessible.
- **Hierarchy through Scale:** Use extreme scale differences. A large `display-md` metric next to a small, uppercase `label-md` creates an "Institutional Report" aesthetic that feels more premium than standard, same-size text.

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than traditional structural lines.

- **The Layering Principle:** Avoid shadows for static content. Place a `surface_container_lowest` card on a `surface` background to create a soft, natural lift.
- **Ambient Shadows:** When an element must "float" (e.g., a dropdown or active modal), use an extra-diffused shadow: `box-shadow: 0 12px 32px -4px rgba(25, 28, 30, 0.06)`. The shadow color is derived from `on_surface` to keep it natural.
- **The Ghost Border:** If a border is required for accessibility (e.g., in high-contrast mode), use `outline_variant` (#c4c6cf) at **20% opacity**. Never use 100% opaque borders.

## 5. Components

### Navigation & Tab Buttons
The top navigation bar should feel integrated, not bolted on.
- **Tab Buttons:** Use `surface_container_low` for the inactive state. The active tab should transition to `primary` (#002045) with `on_primary` text. Use `xl` (0.75rem) or `full` roundedness to mimic the "pill" style seen in the sketch.
- **Interaction:** On hover, inactive tabs should shift to `surface_container_high`.

### Data Visualization: Heat Maps & Charts
- **Heat Map Boxes:** Based on the sketch, these indicators represent data density. Use `secondary` (#2c694e) for positive "success" states and `tertiary_container` (#612100) for "warning" or "attention" states.
- **The "Academic Glow":** Apply a subtle outer glow (using the same color as the box at 30% opacity) to signify the "selected" university's data point, making it stand out in the heat map.
- **Charts:** Forbid grid lines. Use `outline_variant` at 10% opacity for the X/Y axes only if necessary.

### Buttons & Inputs
- **Primary Button:** Gradient of `primary` to `primary_container`. Roundedness: `md` (0.375rem).
- **Input Fields:** Use `surface_container_lowest` for the field background. No border; use a 2px bottom-accent of `primary` only when focused.
- **Cards & Lists:** **No dividers.** Use 24px–32px of vertical padding to separate list items. The white space acts as the separator.

### Status Indicators
- **High-Tech Markers:** For the "Regional" vs. "National" averages (as seen in the sketch), use "Ghost Borders" (2px stroke of `secondary` or `tertiary`) with no fill to represent benchmark data, while the "Actual" data uses a solid fill.

## 6. Do's and Don'ts

### Do:
- **Embrace Asymmetry:** Align text to the left but allow data visualizations to take up unconventional widths to create a dynamic, editorial layout.
- **Use Tonal Depth:** Always check if a background color shift can replace a border.
- **Prioritize Breathing Room:** Use the `xl` spacing tokens between unrelated modules to maintain the "high-end" feel.

### Don't:
- **No Heavy Borders:** Never use #000000 or high-opacity grey borders to box in content.
- **No Standard Drop Shadows:** Avoid "fuzzy" dark shadows that look like 2010-era web design.
- **Don't Crowd the Navigation:** The top bar should have ample horizontal padding to feel like a premium dashboard, not a cramped browser header.