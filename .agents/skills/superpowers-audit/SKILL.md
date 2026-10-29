---
name: superpowers-audit
description: >-
  Systematic codebase, UI/UX, and mobile-first verification workflow inspired by obra/superpowers
  and Antigravity agent skills. Enforces root-cause DOM measurement at 375px/768px/1440px,
  anti-AI-slop design rules, and verification-before-completion.
---

# Superpowers & Antigravity Audit Skill

## 1. Anti-AI-Slop UI Rules
- **No Eyebrow Pill Badges**: Never place rounded-full icon+text pill badges above page titles or section headings. Start directly with a clean, high-contrast heading or functional breadcrumb.
- **No Redundant Announcement Bars**: Keep the mobile viewport focused on search and discovery above the fold.
- **Mobile-First Product Density**: Use 2-column product grids (`grid-cols-2 gap-3 sm:gap-5`) on 375px viewports so students can compare items without endless scrolling.

## 2. Mobile Viewport Lock & Overflow Prevention (375px Standard)
- Root `html, body` and app shells MUST enforce `max-width: 100vw; overflow-x: clip;` so touch scrolling never slides the page horizontally.
- Every flex/grid main container (`<main>`) MUST include `min-w-0 w-full` so horizontal carousels or long text nodes cannot expand the parent flex item beyond `100vw`.
- All horizontal filter bars (`overflow-x-auto`) MUST sit inside a `min-w-0 max-w-full` parent.

## 3. Verification-Before-Completion Checklist
1. Measure `document.documentElement.scrollWidth <= document.documentElement.clientWidth` at `375px` width across all key routes.
2. Run `npm run build` and verify exit code `0` with zero TypeScript errors.
