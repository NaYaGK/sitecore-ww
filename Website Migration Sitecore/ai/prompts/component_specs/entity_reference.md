# Requirements

## Name
Entity Reference

## Description
Content block presenting featured solutions or services in a horizontal layout. Each reference includes an icon, bold title, and short description and typically links to a deeper landing page. Often used on sustainability and product pages to cross-promote related offerings.

## Fields

### Section Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the referenced items.
- **Example Value**: `Related solutions`

### References
- **Field Type**: Treelist (Entity Reference Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of featured items rendered as horizontal cards.
- **Example Value**: `Laundry service`, `Smart lockers`, `Textile recycling`

#### Entity Reference Item Fields:
- **Title**: Single-Line Text - Name of the referenced solution.
- **Description**: Rich Text - Short summary (max 60 words) describing the offer.
- **Icon**: Image - 64×64 icon displayed to the left of the text.
- **CTA Link**: General Link - Destination for the item; entire card links to this URL.
- **CTA Text**: Single-Line Text - Optional explicit link label (defaults to chevron when blank).

## Example Reference
* **URL**: https://www.cws.com/en/workwear/products/business-fashion
* **Element**: `<div class="field field--name-field-landing-page-elements field--type-entity-reference-revisions field__items">`

## Notes
- Cards expand to full width on mobile; ensure descriptions remain concise to avoid long scroll.
- Icon images should have transparent backgrounds and use the brand’s monochrome palette.
- Use this component for contextual cross-links instead of duplicating entire sections of content.

