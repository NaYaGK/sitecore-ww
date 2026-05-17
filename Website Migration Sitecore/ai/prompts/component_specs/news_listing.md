# Requirements

## Name
News Listing

## Description
Structured news list component tailored for manual curation of articles. Renders a vertical list of cards with tag, date, title, teaser, and a CTA linking to the full article. Suitable for pages where editors pick specific stories rather than relying on automated feeds.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the list.
- **Example Value**: `Healthcare news`

### News Items
- **Field Type**: Treelist (News Listing Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered collection of articles to display; recommended maximum of five for readability.
- **Example Value**: `New hygiene concept`, `Lifecycle management update`

#### News Listing Item Fields:
- **Tags**: Multilist - Optional taxonomy tags shown as pills above the title.
- **Publish Date**: Date - Displayed next to the tags; format `DD.MM.YYYY`.
- **Title**: Single-Line Text - Article headline.
- **Description**: Multi-Line Text - Short teaser (max 160 characters).
- **Link**: General Link - Destination for the article; opens in same tab.
- **Image**: Image - Optional thumbnail displayed to the left of the teaser.

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="paragraph paragraph--type--latest-news">`

## Notes
- Unlike the automated Latest News Feed, this component relies solely on authored items—remember to retire outdated stories.
- When an image is supplied, ensure all items include imagery to keep column heights consistent.
- CTA text defaults to “Learn more”; override via dictionary item if localisation requires alternative wording.

