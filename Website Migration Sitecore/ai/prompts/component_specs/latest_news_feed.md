# Requirements

## Name
Latest News Feed

## Description
Dynamically populated news grid pulling recent articles relevant to the current solution area. Displays article image, title, publication date, short teaser, and “Learn more” link for each item. Supports AJAX pagination and filters when embedded on knowledge hub pages.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Section heading appearing above the feed.
- **Example Value**: `Latest insights`

### News Source
- **Field Type**: Droplist
- **Required**: Yes
- **Repeating**: No
- **Notes**: Selects the taxonomy or view used to retrieve articles (e.g., Workwear, Hygiene); determines which posts appear.
- **Example Value**: `Workwear`

### Manual News Items
- **Field Type**: Multilist (News Article Item)
- **Required**: No
- **Repeating**: Yes
- **Notes**: Optional manual override list; when populated, feed uses these items instead of the automatic source.
- **Example Value**: `Workwear blog – RFID tracking`

#### News Article Item Fields:
- **Title**: Single-Line Text - Article headline shown on the card.
- **Summary**: Multi-Line Text - Short teaser (max 160 characters).
- **Image**: Image - 3:2 card image, minimum 800×533px.
- **Publish Date**: Date - Displayed above the title.
- **Article Link**: General Link - Destination URL for the full story.
- **Tag List**: Multilist - Optional taxonomy tags displayed as pills.

### CTA Text
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Overrides the default “Learn more” label used on each card.
- **Example Value**: `Read article`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--latest-news">`

## Notes
- Component fetches four articles by default and exposes “Load more” when additional stories exist.
- Hover states lift the card and reveal tooltip text using the article title; ensure titles remain concise.
- Confirm each article has feature imagery; blank images cause layout gaps in the grid.

