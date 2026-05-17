# Requirements

## Name

Image Gallery

## Description

Swipeable gallery used to showcase product or facility imagery. Renders a horizontally scrollable carousel with lightbox support, enabling users to enlarge images and browse using arrows or touch gestures. Ideal for illustrating workplace environments or garment details.

## Fields

### Title

- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional heading displayed above the gallery.
- **Example Value**: `Inside the laundry process`

### Gallery Images

- **Field Type**: Multilist (Gallery Image Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered sequence of images displayed in the slider; supports up to 12 items.
- **Example Value**: Laundry facility, Inspection detail, Delivery fleet

#### Gallery Image Item Fields:

- **Image**: Image - High-resolution asset (min 1600px wide) for optimal zoom quality.
- **Caption**: Single-Line Text - Optional description shown in the lightbox.
- **Alt Text**: Single-Line Text - Accessible description; defaults to media alt text.

### Enable Thumbnails

- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Shows a row of thumbnail previews below the main gallery when selected.
- **Example Value**: Checked

### Loop Slides

- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Enables infinite looping of gallery slides; otherwise the gallery stops at the last image.
- **Example Value**: Checked

## Example Reference

- **URL**:https://www.cws.com/en/workwear/sectors/construction
- **Element**: `<div class="paragraph paragraph--type--products-list product-filter-workwear product-list-1" data-once="changeProdImages">`

## Notes

- Clicking an image opens the PhotoSwipe lightbox with zoom and fullscreen controls.
- Images lazy-load as they enter the viewport; provide descriptive captions to improve engagement.
- On mobile, the gallery displays a single image per view with swipe navigation and dot indicators.
