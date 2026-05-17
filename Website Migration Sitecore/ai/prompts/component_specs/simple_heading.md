# Requirements

## Name
Simple Heading

## Description
Lightweight heading component used to insert standalone titles between other modules. Outputs a single `<h2>` or `<h3>` element following the page’s typographic scale. Useful for breaking up long-form content without requiring additional copy.

## Fields

### Heading Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Text rendered as the heading; keep under 80 characters.
- **Example Value**: `Our service promise`

### Heading Level
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Selects semantic level (`H2`, `H3`, `H4`); defaults to `H2`.
- **Example Value**: `H3`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/workwear-as-a-service
* **Element**: `<div class="field field--name-field-text field--type-text-long field--label-hidden entity_type-paragraph field__item">`

## Notes
- Component inherits spacing from surrounding layout; avoid consecutive headings without supporting copy.
- Do not use for page-level H1; reserve for subheadings within the content body.
- For accessibility, maintain logical heading order when selecting the level.

