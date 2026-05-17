# Requirements

## Name
Video Player Component

## Description
Embedded video module for showcasing service explainers or customer stories. Uses responsive iframe embeds (typically YouTube or Vimeo) with optional poster image and caption. Supports autoplay toggle and can open in a modal on mobile to improve playback experience.

## Fields

### Video Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Displayed above the player and used for the iframe `title` attribute.
- **Example Value**: `How our workwear service operates`

### Video URL
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Link to the hosted video (YouTube, Vimeo, etc.); use embed URL format when possible.
- **Example Value**: `https://www.youtube.com/watch?v=abcd1234`

### Poster Image
- **Field Type**: Image
- **Required**: No
- **Repeating**: No
- **Notes**: Optional thumbnail shown before playback; 16:9 aspect ratio recommended.
- **Example Value**: `media library/Videos/workwear-service-thumb.jpg`

### Caption
- **Field Type**: Multi-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Short description or credit shown beneath the player.
- **Example Value**: `Discover the full service loop in under two minutes.`

### Autoplay
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Enables autoplay when supported; default unchecked to respect user preferences.
- **Example Value**: Checked

### Open In Modal
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: When enabled, clicking the thumbnail opens the video in the standard modal overlay (recommended for mobile).
- **Example Value**: Checked

## Example Reference
* **URL**: https://www.cws.com/en/workwear/core-solutions
* **Element**: `<iframe title="CWS Workwear service" class="ytp-cued-thumbnail-overlay">`

## Notes
- Iframe automatically inherits responsive wrapper; ensure third-party embeds use HTTPS to avoid mixed content warnings.
- Provide closed captions via the video hosting service to meet accessibility requirements.
- Avoid enabling autoplay alongside modal playback to prevent unexpected audio.

