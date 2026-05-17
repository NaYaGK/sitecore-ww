# Requirements

## Name
Testimonial

## Description
Quote component highlighting customer feedback or expert commentary. Combines testimonial text with author name, role, and optional portrait. Designed to add social proof within solution pages.

## Fields

### Quote
- **Field Type**: Multi-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Testimonial content; keep to 2–3 sentences.
- **Example Value**: `“CWS ensures our garments are always hygienically prepared and delivered on time.”`

### Author Name
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Name of the person providing the quote.
- **Example Value**: `Dr. Julia Weber`

### Author Role
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Job title or organisation for context.
- **Example Value**: `Head of Nursing, ResiDenS`

### Portrait Image
- **Field Type**: Image
- **Required**: No
- **Repeating**: No
- **Notes**: Optional square portrait (min 400×400) displayed next to the quote.
- **Example Value**: `media library/Testimonials/julia-weber.jpg`

### Logo
- **Field Type**: Image
- **Required**: No
- **Repeating**: No
- **Notes**: Optional organisation logo displayed instead of or alongside the portrait.
- **Example Value**: `media library/Logos/residens.svg`

## Example Reference
* **URL**: https://www.cws.com/en/healthcare/elderly-care/residens-service
* **Element**: `<div class="paragraph paragraph--type--testimonial">`

## Notes
- Component supports light and dark themes depending on surrounding section; ensure portrait background suits both.
- Use typographic quotation marks within the quote field; component adds decorative marks automatically.
- If no portrait is supplied, layout centres the quote; ensure author details remain to maintain credibility.

