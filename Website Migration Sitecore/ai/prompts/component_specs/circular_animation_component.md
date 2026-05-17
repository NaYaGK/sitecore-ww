# Requirements

## Name
Circular Animation Component

## Description
Interactive circular storyboard illustrating cyclical processes such as the wash-repair service loop. Displays a central message surrounded by animated steps; hovering or tapping each step reveals explanatory copy. Animation cycles automatically but allows manual navigation.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading shown above the circular diagram.
- **Example Value**: `Our circular textile service`

### Intro Copy
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional paragraph explaining the purpose of the cycle.
- **Example Value**: `<p>Follow each step to see how we keep your garments in top condition.</p>`

### Center Statement
- **Field Type**: Multi-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Short summary or KPI displayed in the centre of the circle.
- **Example Value**: `Full-service loop`

### Steps
- **Field Type**: Treelist (Cycle Step Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered steps rendered around the circle; order determines rotation sequence.
- **Example Value**: `Collection`, `Sorting`, `Washing`, `Repair`, `Delivery`

#### Cycle Step Item Fields:
- **Step Title**: Single-Line Text - Label displayed on the arc.
- **Description**: Rich Text - Tooltip or popover content describing the step.
- **Icon**: Image - 48×48 icon shown next to the title.
- **Duration Label**: Single-Line Text - Optional tag such as “Day 1”.
- **Link**: General Link - Optional deep link for more details on the step.

### Auto Rotate
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Enables automatic cycling through steps; default true.
- **Example Value**: Checked

### Rotation Interval
- **Field Type**: Number
- **Required**: No
- **Repeating**: No
- **Notes**: Milliseconds between automatic transitions; defaults to 5000 when blank.
- **Example Value**: `6000`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/core-solutions/wash-repair-service
* **Element**: `<div class="paragraph paragraph--type--cycle-component" data-once="cycleComponent">`

## Notes
- Component is keyboard accessible: arrow keys cycle steps and focus outline traces active segments—ensure icon contrast supports this interaction.
- Steps collapse into a vertical accordion on mobile; provide concise descriptions to avoid excessive scrolling.
- Keep steps between four and eight to maintain legibility; the animation adapts angles based on count.

