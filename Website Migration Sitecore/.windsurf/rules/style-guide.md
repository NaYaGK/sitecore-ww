---
trigger: model_decision
description: All React components must follow a Tailwind‑first + Sass‑tokens architecture to ensure consistent theming and styling across Storybook and production.
---

Include this context when styling a component automatically.

**Purpose:** Unify component styling under a strict **Tailwind‑first + Sass‑tokens** architecture.  
**Use this file as context for Windsurf or any coding agent.**

**Theme Tokens:** `/src/styles/_theme.scss` - Centralized theme variables  
**Usage Guide:** `/ai/prompts/style/THEME_USAGE_GUIDE.md`

---

## 🧭 STYLING PHILOSOPHY

| Layer           | Technology   | Role                                                       |
| --------------- | ------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Tailwind**    | JSX          | Layout, spacing, responsive, typography utilities          |
| **Sass (SCSS)** | .module.scss | Theme tokens, complex visuals, pseudo‑elements, animations | Global Themes with variables so there should be room to add new themes |

---

## 🎯 OBJECTIVE

Refactor all existing components (~70%) to:

- Use **Tailwind** for all layout & spacing
- Use **Sass** only for design tokens and component‑specific effects
- Replace all hardcoded colors, spacing, and hex values with CSS variables
- Achieve visual consistency across Storybook and production

---

## ✅ TAILWIND — WHEN TO USE

Use directly in `className` attributes for:

- Layout: `flex`, `grid`, `justify-*`, `items-*`, `gap-*`
- Spacing: `p-*`, `m-*`, `space-x-*`, `space-y-*`
- Typography: `text-*`, `font-*`, `leading-*`
- Responsiveness: `sm:`, `md:`, `lg:`, `xl:`
- Borders and radii: `border`, `rounded-md`
- Transitions and transforms: `transition`, `hover:scale-*`
- Color usage via CSS vars: `bg-[var(--color-primary)]`

**Example:**

```tsx
<div className="flex gap-6 p-6 md:grid md:grid-cols-2">
  <h2 className="text-xl font-semibold text-[var(--color-primary)]">Title</h2>
</div>
```

Always use the colors from \_theme.scss file which is standardised dessign tokens.
Dont hardcode the styles with arbitrary values.
