# Requirements

## Name
Individual Products display

## Description
Tabular listing describing each garment included in a bundled workwear solution. Presents product name followed by a bullet list of key attributes or variants. Useful for HACCP and industry-specific packages where the exact items need to be communicated clearly.

## Fields

### Section Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading positioned above the product list.
- **Example Value**: `Package includes`

### Products
- **Field Type**: Treelist (Product Detail Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of products included in the package.
- **Example Value**: `Chef jacket`, `Trousers`, `Apron`

#### Product Detail Item Fields:
- **Product Name**: Single-Line Text - Name displayed as the bullet heading.
- **Attributes**: Treelist (Product Attribute Item) - Nested bullet list describing features, colours, or options.

##### Product Attribute Item Fields:
- **Attribute**: Single-Line Text - Individual characteristic shown as a sub-bullet.

## Example Reference
* **URL**: https://www.cws.com/en/workwear/haccp
* **Element**: `<div class="paragraph one-third paragraph--type--landing-page-rich-text">`

## Notes
- Component renders as a styled unordered list; avoid lengthy sentences for attributes.
- When translating, ensure measurements and standards are adapted to the local market.
- Consider pairing with imagery or download links for detailed product sheets in adjacent components.

