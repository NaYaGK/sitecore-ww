# Requirements

## Name
Image Gallery (Product List Variant)

## Description
Gallery variant embedded within product list pages to showcase multiple product images with optional CTA. Tiles present as a horizontal strip with arrows for navigation, highlighting different garments or use cases. Includes a CTA button guiding users to the full product catalogue.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional heading above the gallery strip.
- **Example Value**: `Image impressions`

### Gallery Items
- **Field Type**: Treelist (Gallery Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered set of images displayed in the slider.
- **Example Value**: `Construction site`, `Locker room`, `Laundry detail`

#### Gallery Item Fields:
- **Image**: Image - 16:9 photo (min 1400×880) spotlighting the product.
- **Alt Text**: Single-Line Text - Accessible description for the image.
- **Caption**: Single-Line Text - Optional label shown below the thumbnail.

### CTA Link
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional button displayed beneath the gallery; links to product finder or download hub.
- **Example Value**: `/en/workwear/products`

### CTA Text
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Label for the CTA button; defaults to “View all products”.
- **Example Value**: `Explore the collection`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/sectors/construction
* **Element**: `<div class="paragraph paragraph--type--products-list product-filter-workwear product-list-1" data-once="changeProdImages">`

## Notes
- Slider previews three images on desktop and converts to swipeable single-image view on mobile.
- CTA button aligns left on desktop and centres on smaller screens; keep label short to avoid wrapping.
- Ensure imagery represents a consistent lighting and colour palette to maintain brand cohesion.

