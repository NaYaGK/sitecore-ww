# Requirements

## Name
Downloads

## Description
Download list presenting brochures, technical sheets, or certificates relevant to the current page. Each entry shows a file type icon, descriptive label, and meta details such as file size. Files open in a new tab and use analytics tracking for conversions.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional heading displayed above the download list.
- **Example Value**: `Downloads`

### Download Items
- **Field Type**: Treelist (Download Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of assets to display; each produces a single row in the list.
- **Example Value**: Product brochure, Safety datasheet

#### Download Item Fields:
- **Display Name**: Single-Line Text - File title shown to users.
- **Description**: Multi-Line Text - Optional supporting copy describing the document contents.
- **File Link**: General Link - Link to a media item or external file (opens in new tab).
- **File Type**: Droplist - Optional override to show icon label (PDF, DOCX, XLSX, etc.); derived from file extension when blank.
- **File Size Override**: Single-Line Text - Optional manual size display (e.g., “1.2 MB”).

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--downloads">`

## Notes
- Component detects linked media metadata to display file type and size automatically when using Sitecore media items.
- For external files, populate the File Size Override to avoid blank meta columns.
- Limit the list to a maximum of eight items to maintain vertical rhythm on long pages.

