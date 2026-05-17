# Requirements

## Name
WYSIWYG Table

## Description
Rich-text table module used to present feature comparisons, service levels, or pricing snippets. Authors manage the table via the WYSIWYG editor, enabling custom rows, columns, and basic formatting such as bold headers.

## Fields

### Table Content
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Insert a semantic HTML `<table>` using the editor; include `<thead>` and `<tbody>` for accessibility.
- **Example Value**: `<table><thead><tr><th>Service</th><th>Included</th></tr></thead><tbody><tr><td>Weekly pickup</td><td>Yes</td></tr></tbody></table>`

### Caption
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional caption shown below the table; also used as the HTML `<caption>`.
- **Example Value**: `Overview of HACCP package features`

### Sticky Header
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Keeps header row visible while scrolling horizontally on smaller screens.
- **Example Value**: Checked

## Example Reference
* **URL**: https://www.cws.com/en/workwear/additional-solutions/smartlockers
* **Element**: `<div class="paragraph paragraph--type--wysiwyg-text">`

## Notes
- Avoid merging cells excessively; complex row spans can break responsive behaviour.
- Ensure table data is duplicated in plain text elsewhere if critical, for users on narrow devices.
- Use consistent units and abbreviations across columns for clarity.

