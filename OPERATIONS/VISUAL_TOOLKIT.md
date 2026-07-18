# AMMA / Fina Calle Visual Toolkit

Use this stack for new pages, page redesigns, visual intake, owner portals, customer portals, and promotional web surfaces. It is free to use and does not add production runtime dependencies.

## Installed tools

| Layer | Tool | Purpose | Location |
| --- | --- | --- | --- |
| Direction | Anthropic `frontend-design` | Produce brand-specific visual concepts and avoid generic AI defaults | `.agents/skills/frontend-design/` and `.claude/skills/frontend-design/` |
| Review | Vercel `web-design-guidelines` | Audit accessibility, forms, focus, typography, interaction, images, and UX | `.agents/skills/web-design-guidelines/` and `.claude/skills/web-design-guidelines/` |
| Visual source | Figma connector | Let Codex inspect chosen frames and design sources instead of guessing | User-level Codex plugin |
| Visual proof | Codex Browser / Claude browser | Capture the current screen and compare the implementation at the same viewport and state | Agent browser capability |
| Measurable QA | Chrome DevTools Lighthouse | Check accessibility, performance, best practices, and SEO without adding packages to the app | Chrome DevTools |

Skill versions and upstream hashes are locked in `skills-lock.json`.

## Required sequence

1. Capture the current screen or use the selected Figma frame. Do not design from vague prose when a real product surface exists.
2. Read `frontend-design`; state the audience, page job, token direction, and one justified signature element.
3. Build from existing Fina Calle components and tokens. Do not introduce a new UI framework without a demonstrated gap.
4. Remove container soup: a section does not automatically receive a radius, full border, background, shadow, and padding.
5. Preserve semantic boundaries for inputs, focus, active controls, security/payment states, confirmations, and warnings.
6. Read `web-design-guidelines` and review only the touched files.
7. Run targeted ESLint and `npm.cmd run build` from `APP/web`.
8. Compare before and after at the same viewport and state. Fix visible hierarchy, spacing, wrapping, contrast, and responsive errors.
9. Use Lighthouse from Chrome DevTools for release-candidate accessibility/performance evidence when the route is available in the approved browser.

## Deliberately not installed

- Storybook: useful once AMMA maintains a reusable component catalog, but premature today and adds a large toolchain.
- A new component library: Fina Calle already has React, Tailwind, and Lucide. Another library would increase sameness and maintenance without solving the visual-judgment problem.
- Lighthouse as an npm dependency: a trial added 532 packages and reported 19 moderate advisories. It was removed; the Chrome DevTools version provides the audit without application bloat.
