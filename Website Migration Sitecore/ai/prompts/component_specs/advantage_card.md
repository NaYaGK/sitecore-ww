# Requirements

## Name
Advantage Card

## Description
Modular benefit grid that highlights key advantages of CWS services. Each card presents an icon, short headline, supporting copy, and optional CTA button, arranged in a responsive three-column layout. Commonly used to promote differentiators such as sustainability, safety, or service quality.

## Fields

### Section Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the grid; keep to one concise sentence.
- **Example Value**: `Why choose CWS Workwear`

### Intro Copy
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional supporting paragraph shown beneath the section title.
- **Example Value**: `Benefit from a full-service rental model, innovative textiles, and expert hygiene consulting.`

### Advantage Cards
- **Field Type**: Treelist (Advantage Card Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of cards displayed in the grid; recommend three or six items for balance.
- **Example Value**: Sustainability, All-in Service, Safety

#### Advantage Card Item Fields:
- **Icon**: Image - 80×80 SVG or PNG representing the advantage.
- **Headline**: Single-Line Text - Card title; keep under 45 characters.
- **Description**: Rich Text - Short paragraph (1–2 sentences) elaborating on the benefit.
- **CTA Text**: Single-Line Text - Optional text for inline link or button; omit if not needed.
- **CTA Link**: General Link - Destination for the CTA text.

### Section CTA
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional button displayed below the grid driving users to a broader overview or contact form.
- **Example Value**: `/en/workwear/service`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="sa-workwear paragraph paragraph--type--advantages has-arrows">`

## Notes
- Cards have equal height; keep copy length similar to maintain alignment.
- Icons inherit the CWS red accent; upload monochrome artwork for best results.
- On mobile, cards stack vertically with icons centered above text—avoid large paragraphs.
