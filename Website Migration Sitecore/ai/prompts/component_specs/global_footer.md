# Requirements

## Name
GlobalFooter

## Description
Slim legal footer displayed beneath solution-area footers across the site. Presents copyright text alongside a compact list of utility links such as privacy policy, imprint, and cookie settings. The component spans the full viewport width and inherits the dark brand theme.

## Fields

### Copyright
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Include the current year and legal entity; content renders as plain text with the © symbol.
- **Example Value**: `© 2024 CWS International GmbH`

### Utility Links
- **Field Type**: Treelist (Footer Utility Link)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of legal/utility links displayed to the right of the copyright.
- **Example Value**: Privacy Policy, Cookie Settings

#### Footer Utility Link Fields:
- **Link Text**: Single-Line Text - Visible label for the utility link.
- **Destination**: General Link - Target URL; supports internal Sitecore items or external pages.
- **Open In New Tab**: Checkbox - Enable when linking to external resources (e.g., cookie preferences).

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="global-footer">`

## Notes
- Renders as a single row with text left-aligned and links right-aligned on desktop; on mobile all items stack centered.
- Links inherit global footer typography and spacing—limit link text to short labels to avoid wrapping.
- Ensure the copyright year updates annually; consider binding to a token or scheduled task.

