# Requirements

## Name
Node-Full View

## Description
Full content-page layout container that assembles multiple horizontal cards beneath the page hero. Each card features an image, descriptive copy, and CTA, with an optional layout toggle controlling the image width. Designed for best-seller and solution overview pages.

## Fields

### Page Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: H1 title shown at the top of the page body; typically mirrors the page item name.
- **Example Value**: `Bestsellers`

### Intro Copy
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional introductory paragraph displayed before the horizontal cards.
- **Example Value**: `<p>Explore customer favourites across our workwear portfolio.</p>`

### Horizontal Cards
- **Field Type**: Treelist (Horizontal Card Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of cards rendered down the page; each card can adjust its media layout.
- **Example Value**: `Hi-Vis Essentials`, `Rental Service`, `Protective Gear`

#### Horizontal Card Item Fields:
- **Image Layout**: Droplist - Chooses layout variant (`half-width`, `third-width`); determines image/text ratio.
- **Image**: Image - Card visual, ideally 1200×800.
- **Title**: Single-Line Text - Card heading displayed above the description.
- **Description**: Rich Text - Supporting copy; allow up to 120 words.
- **CTA Text**: Single-Line Text - Button label placed at the end of the card.
- **CTA Link**: General Link - Destination for the CTA button.
- **Secondary CTA Text**: Single-Line Text - Optional secondary button label.
- **Secondary CTA Link**: General Link - Destination for the secondary button.

## Example Reference
* **URL**: https://www.cws.com/en/workwear/products/bestsellers
* **Element**: `<article class="node node--type-content-page node--view-mode-full">`

## Notes
- Component acts as the main page body container; ensure cards are sequenced to tell a cohesive story.
- Layout toggles adjust CSS classes to swap image alignment; vary selections to create visual interest.
- Cards support lazy-loaded images and CTA tracking; configure analytics goals for key destinations.
