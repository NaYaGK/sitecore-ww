# Requirements

## Name
Workwear Collections (Teaser Grid)

## Description
Featured grid highlighting flagship workwear collections. Each tile displays a full-bleed image with overlay title and CTA button that links to the relevant collection detail page. Cards animate on hover and arrange in a responsive multi-column layout optimised for three-wide rows on desktop.

## Fields

### Section Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the grid; keep concise.
- **Example Value**: `Discover our workwear collections`

### Intro Copy
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional paragraph providing context for the curated collections.
- **Example Value**: `<p>Explore curated outfits tailored for specific industries and safety requirements.</p>`

### Collections
- **Field Type**: Treelist (Collection Teaser Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of tiles rendered in the grid; three to six tiles recommended.
- **Example Value**: Construction, Healthcare, Food Service

#### Collection Teaser Item Fields:
- **Title**: Single-Line Text - Overlay title displayed on the card.
- **Card Image**: Image - Featured photography (min 1200×800) representing the collection.
- **CTA Text**: Single-Line Text - Button label; defaults to “Discover”.
- **CTA Link**: General Link - Destination to the collection detail page.
- **Overlay Shade**: Droplist - Optional overlay intensity (`light`, `medium`, `dark`) applied behind text for contrast.
- **Analytics Tag**: Single-Line Text - Optional data attribute used for campaign tracking.

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--product-teaser">`

## Notes
- Grid leverages lazy loading for background images; provide descriptive alt text for accessibility.
- Keep CTA text lengths consistent so buttons align across the row.
- Overlay automatically adjusts contrast based on the selected shade; choose imagery that leaves clear space for text.

