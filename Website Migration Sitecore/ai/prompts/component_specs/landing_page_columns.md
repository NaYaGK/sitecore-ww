# Requirements

## Name
Landing Page Columns

## Description
Three-column content band used on landing pages to surface key service benefits or differentiators. Each column renders an icon, bold title, and short descriptive copy, leveraging the reusable card component. Auto-adjusts to two columns on tablet and single column on mobile.

## Fields

### Section Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Optional heading displayed above the column set; keep succinct.
- **Example Value**: `What sets our service apart`

### Description
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Short introductory paragraph explaining the trio of highlights.
- **Example Value**: `From onboarding to daily service, our team manages every step of your workwear lifecycle.`

### Columns
- **Field Type**: Treelist (Landing Page Column Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered collection of cards rendered in columns; three items recommended for balanced layout.
- **Example Value**: Quality Assurance, Sustainability, Regional Service

#### Landing Page Column Item Fields:
- **Icon**: Image - 64×64px icon shown at the top of the card.
- **Title**: Single-Line Text - Column headline; keep under 45 characters.
- **Body Copy**: Rich Text - Brief description (up to 70 words) explaining the value proposition.
- **CTA Text**: Single-Line Text - Optional inline link label.
- **CTA Link**: General Link - Destination URL for the CTA text.

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="field field--name-field-landing-page-elements field--type-entity-reference-revisions field__items">`

## Notes
- Columns inherit background color from the surrounding section; ensure icons use transparent backgrounds for consistency.
- When fewer than three cards are authored, remaining slots collapse to keep cards centered.
- Cards reuse the global card component styling, so updates to card theming cascade automatically.

