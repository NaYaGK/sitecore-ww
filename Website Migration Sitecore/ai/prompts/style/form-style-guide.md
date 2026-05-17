# CWS Form Styling Guide

> **Atomic component styles for Sitecore form elements**

---

## Table of Contents

1. [Overview](#overview)
2. [What This Provides vs Sitecore](#what-this-provides-vs-sitecore)
3. [Architecture](#architecture)
4. [CSS Custom Properties](#css-custom-properties)
5. [Atomic Components](#atomic-components)
6. [Best Practices](#best-practices)

---

## Overview

This form styling system provides **atomic component styles** for individual form elements. Layout, spacing, and overall structure are controlled by Sitecore.

### Key Principles

- **Atomic styles only**: Individual element appearance (inputs, checkboxes, buttons)
- **No layout styles**: Padding, margin, background handled by Sitecore
- **CSS Custom Properties**: Colors and typography are tokenized
- **Auto-injection**: `.cws-form` class is automatically added by `FormValidation.tsx`

---

## What This Provides vs Sitecore

### This CSS Provides (Atomic Appearance)

| Element        | What We Style                               |
| -------------- | ------------------------------------------- |
| **Inputs**     | Underline border, focus state, typography   |
| **Labels**     | Font styling, floating label animation      |
| **Checkboxes** | Custom square appearance, checked indicator |
| **Radios**     | Custom circle appearance, filled state      |
| **Buttons**    | Red pill style, hover/active states         |
| **Select**     | Custom dropdown arrow, border style         |
| **Validation** | Error/success colors                        |

### Sitecore Controls (Layout)

- Form container width/max-width
- Padding and margin
- Background colors
- Grid/flex layout
- Field spacing and gaps
- Heading typography
- Overall form structure

---

## Architecture

```
src/assets/styles/forms/
├── index.css           # Entry point
├── _base.css           # CSS variables only
├── _labels.css         # Label + floating label
├── _inputs.css         # Text input appearance
├── _textarea.css       # Textarea appearance
├── _select.css         # Dropdown appearance
├── _radio.css          # Radio button appearance
├── _checkbox.css       # Checkbox appearance
├── _button.css         # Button appearance
├── _validation.css     # Error/success states
└── FORMS_STYLE_GUIDE.md
```

### Module Responsibilities

| Module            | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `_base.css`       | CSS custom properties (tokens) only        |
| `_labels.css`     | Label typography, floating label animation |
| `_inputs.css`     | Text input underline style, focus state    |
| `_textarea.css`   | Textarea underline style                   |
| `_select.css`     | Custom dropdown arrow                      |
| `_radio.css`      | Custom radio circle with fill              |
| `_checkbox.css`   | Custom checkbox square with indicator      |
| `_button.css`     | Red pill button style                      |
| `_validation.css` | Error/success color states                 |

---

## CSS Custom Properties

All design tokens are defined in `_base.css` and can be overridden:

### Colors

```css
--form-color-text: #121212; /* Primary text */
--form-color-text-muted: #666666; /* Secondary text */
--form-color-bg: #ffffff; /* Background */
--form-color-border: rgba(18, 18, 18, 0.2); /* Default border */
--form-color-border-focus: #121212; /* Focus border */
--form-color-error: #e3001b; /* Error/CTA red */
--form-color-success: #28a745; /* Success green */
--form-color-link: #e3001b; /* Link color */
```

### Typography

```css
--form-font-family: "Suisse Intl", system-ui, sans-serif;
--form-font-size-base: 1rem; /* 16px */
--form-font-size-sm: 0.875rem; /* 14px */
--form-font-size-xs: 0.75rem; /* 12px */
--form-line-height: 1.5;
```

### Spacing

```css
--form-spacing-xs: 0.25rem; /* 4px */
--form-spacing-sm: 0.5rem; /* 8px */
--form-spacing-md: 1rem; /* 16px */
--form-spacing-lg: 1.5rem; /* 24px */
--form-spacing-xl: 2rem; /* 32px */
```

### Sizing

```css
--form-max-width: 350px; /* Form container max-width */
--form-input-min-height: 24px; /* Input minimum height */
--form-button-min-height: 48px; /* Button minimum height */
```

### Transitions

```css
--form-transition-fast: 0.15s ease; /* Quick interactions */
--form-transition-base: 0.2s ease; /* Standard transitions */
--form-transition-slow: 0.3s ease; /* Animations */
```

---

## Selectors Strategy

### ✅ DO: Use class-based selectors

```css
/* Good - generic, works for all forms */
.cws-form input[type="text"] {
  border-bottom: 1px solid var(--form-color-border);
}

.cws-form .form-field-label {
  color: var(--form-color-text);
}
```

### ❌ DON'T: Use hardcoded IDs in base modules

```css
/* Bad - only works for one form */
form[data-formid="32337697abb5491ca8f64104b9e569bc-euw"] input {
  border: none;
}
```

### ✅ DO: Use form IDs only in override files

```css
/* Good - in _hero-form.css (form-specific override file) */
form[data-formid="32337697abb5491ca8f64104b9e569bc-euw"] .special-field {
  background: yellow;
}
```

---

## Adding New Forms

### Step 1: Apply the base class

```jsx
<form className="cws-form" data-formid="new-form-id">
```

### Step 2: Check if base styles are sufficient

Most forms should work with just `.cws-form`. Only create override files if needed.

### Step 3: Create override file (if needed)

```bash
# Create new file
touch src/assets/styles/forms/_new-form.css
```

```css
/* _new-form.css */
/* =====================================================
   New Form Overrides
   Form ID: new-form-id
   ===================================================== */

/* Only include form-specific rules */
form[data-formid="new-form-id"] .special-element {
  /* Custom styles */
}
```

### Step 4: Import in index.css

```css
/* Form-specific overrides */
@import "./_hero-form.css";
@import "./_new-form.css"; /* Add your new form */
```

---

## Best Practices

### 1. Avoid `!important`

```css
/* ❌ Bad */
.cws-form input {
  border: none !important;
}

/* ✅ Good - use proper specificity */
.cws-form .form-input-wrapper-div input {
  border: none;
}
```

### 2. Use CSS Custom Properties

```css
/* ❌ Bad - hardcoded values */
.cws-form label {
  color: #121212;
  font-size: 14px;
}

/* ✅ Good - use tokens */
.cws-form label {
  color: var(--form-color-text);
  font-size: var(--form-font-size-sm);
}
```

### 3. Keep overrides minimal

```css
/* ❌ Bad - duplicating base styles */
form[data-formid="xyz"] input {
  width: 100%;
  font-size: 1rem;
  border: none;
  border-bottom: 1px solid #ccc;
  /* ... 20 more lines */
}

/* ✅ Good - only override what's different */
form[data-formid="xyz"] input {
  border-bottom-color: blue;
}
```

### 4. Group related selectors

```css
/* ✅ Good - grouped by purpose */
/* Input base styles */
.cws-form input[type="text"],
.cws-form input[type="email"],
.cws-form input[type="tel"] {
  /* shared styles */
}
```

### 5. Document form-specific overrides

```css
/* =====================================================
   Hero Form Overrides
   Form ID: 32337697abb5491ca8f64104b9e569bc-euw
   
   Purpose: Contact form on homepage hero section
   Special requirements: Floating labels, compact layout
   ===================================================== */
```

### 6. Consider accessibility

```css
/* ✅ Good - visible focus states */
.cws-form input:focus-visible {
  outline: 2px solid var(--form-color-border-focus);
  outline-offset: 2px;
}

/* ✅ Good - sufficient color contrast */
.cws-form .error-message {
  color: var(--form-color-error); /* WCAG AA compliant */
}
```

---

## File Structure

```
forms/
├── index.css              # Entry point - import this file
│
├── _base.css              # ⬅️ CSS variables defined here
├── _labels.css            # Label styles
├── _inputs.css            # Text input styles
├── _textarea.css          # Textarea styles
├── _select.css            # Select/dropdown styles
├── _radio.css             # Radio button styles
├── _checkbox.css          # Checkbox styles
├── _button.css            # Button styles
├── _validation.css        # Error/success states
│
├── _hero-form.css         # Form-specific overrides
├── _[form-name]-form.css  # Add more as needed
│
└── FORMS_STYLE_GUIDE.md   # This documentation
```

---

## Examples

### Example 1: Basic Contact Form

```jsx
<div className="cws-form-wrapper">
  <form className="cws-form">
    <div className="form-input-wrapper-element">
      <span className="form-field-label">Name *</span>
      <div className="form-input-wrapper-div">
        <input type="text" className="form-input-element" required />
      </div>
    </div>

    <div className="form-input-wrapper-element">
      <span className="form-field-label">Email *</span>
      <div className="form-input-wrapper-div">
        <input type="email" className="form-input-element" required />
      </div>
    </div>

    <div className="button-component">
      <button type="submit" className="submit-button">
        Submit
      </button>
    </div>
  </form>
</div>
```

### Example 2: Form with Error State

```jsx
<div className="form-input-wrapper-element has-error">
  <span className="form-field-label">Email *</span>
  <div className="form-input-wrapper-div">
    <input type="email" className="form-input-element" />
  </div>
  <span className="form-field-validation-error">
    Please enter a valid email address
  </span>
</div>
```

### Example 3: Checkbox with Link

```jsx
<div className="checkbox-field">
  <div className="form-input-wrapper-div">
    <input type="checkbox" required />
  </div>
  <span className="form-field-label">
    I agree to the <a href="/privacy">Privacy Policy</a>
  </span>
</div>
```

---

## Changelog

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2025-12-19 | Initial refactoring - removed all hardcoded form IDs from base modules |
| 2025-12-19 | Added CSS custom properties for all design tokens                      |
| 2025-12-19 | Created modular architecture with separate files per field type        |
| 2025-12-19 | Added this documentation                                               |

---

## Questions?

If you need to add a new form or have questions about the styling system, refer to this guide or check the existing override files for examples.
