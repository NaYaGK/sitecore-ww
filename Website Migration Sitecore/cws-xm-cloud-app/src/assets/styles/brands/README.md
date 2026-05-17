# Brand Colors Directory

This directory contains brand-specific color definitions for all CWS brands.

## Structure

Each brand has its own SCSS file that defines:

- `$brand-color-primary` - Main brand color
- `$brand-color-primary-light` - Light variant
- `$brand-color-primary-dark` - Dark variant (hover state)
- `$brand-color-primary-soft` - 35% opacity
- `$brand-color-primary-bg` - 70% opacity (for backgrounds)
- `$brand-name` - Brand identifier

## Available Brands

| File               | Brand       | Color  | Hex       |
| ------------------ | ----------- | ------ | --------- |
| `_workwear.scss`   | Workwear    | Yellow | `#F9E244` |
| `_healthcare.scss` | Healthcare  | Green  | `#ACD800` |
| `_hygiene.scss`    | Hygiene     | Blue   | `#97C9EB` |
| `_firesafety.scss` | Fire Safety | Orange | `#FFB447` |
| `_clearroom.scss`  | Clearroom   | Teal   | `#73E0C1` |
| `_floorcare.scss`  | Floorcare   | Blue   | `#97C9EB` |

## Loader

`_index.scss` dynamically loads the correct brand based on the `$BRAND` variable.

Default: `workwear`

## Usage

The brand colors are automatically loaded when you import the theme:

```scss
@use '../../styles/theme' as *;

.myComponent {
  background: $color-accent-primary; // Uses active brand color
}
```

## Switching Brands

See `/src/styles/BRAND_SWITCHING_GUIDE.md` for detailed instructions.

Quick switch via environment variable:
