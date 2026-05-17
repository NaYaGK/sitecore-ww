# Requirements

## Name
Product Teaser Grid

## Description
Grid of product or category teasers highlighting key offerings within a solution area. Each tile combines imagery, category title, and a call-to-action button that links to a deep product or service page. Layout presents up to three cards per row on desktop and stacks responsively on tablet/mobile.

## Fields

### Section Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the grid; keep concise to fit within one line.
- **Example Value**: `Our workwear collections`

### Product Tiles
- **Field Type**: Treelist (Product Teaser Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of tiles rendered in the grid; author can select up to six for best layout.
- **Example Value**: Workwear for Industry, High-visibility gear, Corporate fashion

#### Product Teaser Item Fields:
- **Title**: Single-Line Text - Visible card title; defaults to referenced product name if override left blank.
- **Summary**: Multi-Line Text - Optional short subtitle shown under the title; omit for minimal layout.
- **Card Image**: Image - Landscape image (min 900×600) illustrating the product or category.
- **CTA Text**: Single-Line Text - Button label displayed at the bottom of the tile.
- **CTA Link**: General Link - Destination for the tile; supports internal product pages or external catalogues.
- **Product Reference**: Droplink - Optional pointer to a product data item for personalization or analytics.
- **Title Override**: Single-Line Text - Optional custom heading when the product reference label should differ.
- **Fallback Image**: Image - Optional alternate image used when referenced product lacks media.

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--product-teaser">`

## Notes
- Cards animate on hover with an upward lift and shadow; ensure imagery includes a safe margin to avoid cropping faces.
- Maintain consistent CTA text length to keep buttons aligned across the row.
- Component supports lazy-loading images; provide descriptive alt text for each card image for accessibility.

