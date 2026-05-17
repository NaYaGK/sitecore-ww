# Requirements

## Name
Logos

## Description
Compact strip displaying partner or certification logos associated with the current solution. Logos appear in a horizontal row with optional heading and can link to external verification pages. Useful for building trust by highlighting affiliations.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Heading positioned above the logos; hide when not needed.
- **Example Value**: `Trusted by leading healthcare partners`

### Logos
- **Field Type**: Multilist (Logo Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Collection of logos displayed left to right; order matches author selection.
- **Example Value**: `Red Cross`, `wear2wear™`, `OEKO-TEX®`

#### Logo Item Fields:
- **Image**: Image - Transparent PNG/SVG sized ~160×80px.
- **Alt Text**: Single-Line Text - Accessible description of the logo.
- **Link**: General Link - Optional destination (external page or internal article).

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="paragraph paragraph--type--wysiwyg-text">`

## Notes
- Component automatically scales logos to fit; upload consistent aspect ratios to avoid visual jumps.
- On mobile, logos wrap to multiple rows with centered alignment.
- Avoid more than eight logos to maintain readability; use multiple rows or carousel if necessary.

