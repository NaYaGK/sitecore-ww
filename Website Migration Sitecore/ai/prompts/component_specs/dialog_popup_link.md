# Requirements

## Name
Dialog popup link

## Description
Inline link or button that opens supplemental content in a modal dialog. Commonly used to expose hygiene certificates, process videos, or forms without navigating away from the page. Appears as a text link styled with an arrow icon.

## Fields

### Link Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Visible label for the trigger; keep short (e.g., “See hygiene process”).
- **Example Value**: `View HACCP certificate`

### Destination Link
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: URL opened when JavaScript fallback is used; should point to the same resource as the modal content.
- **Example Value**: `/en/workwear/haccp/certificate`

### Dialog Content Item
- **Field Type**: Droplink
- **Required**: Yes
- **Repeating**: No
- **Notes**: References the modal body content (e.g., WYSIWYG snippet, form, or media); rendered inside the dialog.
- **Example Value**: `/sitecore/content/CWS/Shared/Dialogs/HACCP Certificate`

### Tracking Event Name
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Custom analytics identifier fired when the dialog opens.
- **Example Value**: `popup-haccp-certificate`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/haccp
* **Element**: `<div class="links-wrapper">`

## Notes
- Component binds click events to launch the shared modal; ensure dialog content items follow accessibility guidelines (focus trap, close button).
- Provide a meaningful fallback link for users with JavaScript disabled.
- Multiple popup links can be stacked; each should use a unique tracking event for reporting.

