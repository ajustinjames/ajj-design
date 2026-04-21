Industrial-Material Design System Manifesto

1. Architectural Philosophy

Core Technology: Lit (Web Components) for a framework-agnostic core (React/Angular/HTML).

Styling: Tailwind CSS v4 using CSS Custom Properties (Tokens).

Design Tokens: 3-tier structure (Global -> Alias -> Component).

Cross-Platform Sync: Style Dictionary v4 configured to export CSS Variables (Web) and ThemeData classes (Flutter).

Component Scope: Tier A (Visual-only). Frameworks handle internal state; Lit handles the "skin."

2. The "Anti-Slop" Visual Identity

Corner Radii: Strictly 0px (Sharp) or 2px (Technical). NEVER use "pill" shapes.

Elevation: No blurry shadows. Use Hard-Cast Shadows with specific offsets (e.g., 2px 2px 0px #000).

Gradients: Strictly forbidden. Use solid colors or high-contrast borders for depth.

Typography:

UI: Inter

Status/Technical/Metadata: JetBrains Mono

Density: High-density 4px grid. Tight padding, compact interfaces.

Color Logic: Neutral "Paper" backgrounds (#F0F0EC) with high-contrast "International Orange" (#FF4F00) accents.

3. Engineering Requirements

Standard: Use Radix UI primitives for complex A11y logic, wrapped in Lit components.

Documentation: Every component MUST have a Storybook 10.x file.

Sync Logic: Any change to tokens.json must trigger a build for both tokens.css and tokens.dart.

Naming: Follow the ds- prefix for all components (e.g., <ds-button>, <ds-card>).

4. Coding Standards

Use TypeScript for all components.

Prefer Functional approach in Lit.

No third-party UI libraries allowed except for headless primitives.