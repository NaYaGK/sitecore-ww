# Requirements

## Name
Slider Component

## Description
Horizontally scrolling storytelling component that pins to the viewport while users swipe through a sequence of cards. Each slide combines an image, title, body copy, and CTA, guiding visitors through multi-step narratives such as service journeys. Commonly used on healthcare subpages.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the pinned slider.
- **Example Value**: `How our service supports you`

### Slides
- **Field Type**: Treelist (Slider Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered sequence of slides; four to six slides recommended.
- **Example Value**: `Consultation`, `Fitting`, `Laundry cycle`

#### Slider Item Fields:
- **Title**: Single-Line Text - Slide heading.
- **Description**: Rich Text - 2–3 paragraph narrative for the step.
- **Image**: Image - Background or supporting photo (min 1600×900).
- **CTA Text**: Single-Line Text - Optional button label.
- **CTA Link**: General Link - Destination for the CTA.
- **Background Theme**: Droplist - Optional class controlling slide colour (`light`, `dark`).

### Progress Indicator Label
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Text displayed alongside slide counter (e.g., “Step”).
- **Example Value**: `Step`

### Enable Snap Scroll
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: When checked, slider locks to each slide using scroll snapping; otherwise scroll is free-flow.
- **Example Value**: Checked

## Example Reference
* **URL**: https://www.cws.com/en/healthcare/elderly-care
* **Element**: `<div class="scrollmagic-pin-spacer">`

## Notes
- Component pins to the viewport until the final slide is scrolled past; ensure page sections before and after have sufficient height.
- On mobile the slider degrades to a standard swipe carousel to preserve usability.
- Large images are lazy-loaded; optimise assets to keep total slider payload under 2 MB.

