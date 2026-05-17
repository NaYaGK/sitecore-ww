# 🎨 Tailwind‑First Style Guide

**Purpose:** Unify component styling under a strict **Tailwind‑first + Sass‑tokens** architecture.  
**Use this file as context for Windsurf or any coding agent.**

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

## Brand Colors Reference

The following brand colors are available in the system:

| Brand       | RGB                | Hex       |
| ----------- | ------------------ | --------- |
| Workwear    | rgb(249, 226, 68)  | `#F9E244` |
| Healthcare  | rgb(172, 216, 0)   | `#ACD800` |
| Hygiene     | rgb(151, 201, 235) | `#97C9EB` |
| Fire Safety | rgb(255, 180, 71)  | `#FFB447` |
| Clearroom   | rgb(115, 224, 193) | `#73E0C1` |
| Floorcare   | rgb(151, 201, 235) | `#97C9EB` |

> **Note:** Currently, we are working only on the **Workwear** brand.
