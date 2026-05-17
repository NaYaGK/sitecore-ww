# Requirements

## Name
Industry Teaser Grid

## Description
Masonry grid showcasing industry-specific teaser cards that link to dedicated sector pages. Displays up to three columns on desktop with staggered heights, using imagery and short copy to entice exploration. Ideal for the “Workwear sectors” landing page.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Section heading positioned above the grid.
- **Example Value**: `Workwear for your industry`

### Intro Copy
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional paragraph that frames the set of industries.
- **Example Value**: `<p>Select your sector to discover tailored workwear solutions.</p>`

### Industry Teasers
- **Field Type**: Multilist (Industry Sector Teaser)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Choose the sector teasers to display; ordering controls masonry placement.
- **Example Value**: Construction, Healthcare, Hospitality

#### Industry Sector Teaser Fields:
- See `industry_sector_teaser.md` for full definition of the referenced item template.

## Example Reference
* **URL**: https://www.cws.com/en/workwear/sectors
* **Element**: `<div class="paragraph paragraph--type--teasers no-lazy masonry-inst-1">`

## Notes
- Component uses Masonry layout to auto-balance heights—ensure teaser copy remains consistent to avoid extreme unevenness.
- Images lazy-load with fade-in effect; provide alt text specific to each sector.
- On mobile, teasers stack in a single column but retain hover/focus states for accessibility.
