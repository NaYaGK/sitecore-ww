# Requirements

## Name
Accordion Item

## Description
Individual FAQ entry used within the accordion component. Consists of a question label that acts as the expandable trigger and a rich-text answer revealed beneath when opened. Items can be authored once and reused across multiple accordion instances.

## Fields

### Question
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Concise question shown on the collapsed row; limit to ~90 characters to prevent wrapping.
- **Example Value**: `How often will our garments be collected?`

### Answer
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Detailed response displayed when the item expands; supports paragraphs, lists, and inline links.
- **Example Value**: `<p>We collect, wash, repair, and return your garments weekly. Emergency pickups can be scheduled on request.</p>`

### Support Link
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional inline link appended at the end of the answer (e.g., to a knowledge base article).
- **Example Value**: `/en/workwear/service-faq`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/products
* **Element**: `<div class="paragraph paragraph--type--qa">`

## Notes
- Each accordion consumes the item content and controls expansion; avoid nesting accordions inside answer text.
- Provide semantic markup (lists, bold labels) to ensure answers remain readable on mobile devices.
- When reusing items across languages, translate both question and answer to the target locale.

