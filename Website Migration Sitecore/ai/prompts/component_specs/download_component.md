# Requirements

## Name
Download component

## Description
Single download callout featuring a prominent button and optional description. Used to promote key assets such as sustainability reports or brochures within a page flow. Provides analytics-friendly tracking for high-value downloads.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional heading displayed above the button.
- **Example Value**: `Download our sustainability report`

### Description
- **Field Type**: Multi-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Brief supporting copy describing the asset.
- **Example Value**: `Learn how CWS is reducing textile waste across Europe.`

### Document Link
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Target file or landing page; opens in new tab when linking to PDFs.
- **Example Value**: `/media-library/Documents/CWS_Sustainability_Report.pdf`

### Button Label
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Text displayed on the download button.
- **Example Value**: `Download PDF`

### File Meta Override
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional suffix appended below the button (e.g., “PDF, 4.2 MB”).
- **Example Value**: `PDF, 4.2 MB`

## Example Reference
* **URL**: https://www.cws.com/en/healthcare/sustainability
* **Element**: `<div class="paragraph paragraph--type--downloads">`

## Notes
- Button inherits solution accent colour; keep label short to avoid wrapping.
- When linking to external storage, ensure CORS headers allow direct download.
- Track conversions by configuring goal triggers on the Document Link field.

