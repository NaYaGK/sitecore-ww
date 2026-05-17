# Requirements

## Name
Sticky Contact Bar

## Description
Floating contact trigger pinned to the viewport edge that invites visitors to request a call. Collapsed state shows a compact “Contact us” pill; when tapped, the panel expands to reveal a prominent phone number and optional link to a contact form. Available globally so users can engage without scrolling to the footer.

## Fields

### Teaser Label
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Copy displayed on the collapsed pill (e.g., “Need advice?”); keep it short to avoid wrapping.
- **Example Value**: `Talk to our experts`

### Contact Number
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Primary phone number presented in the expanded panel and used to build the `tel:` link.
- **Example Value**: `+49 211 875 398 420`

### Secondary CTA Link
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional button linking to a contact or booking form; leave empty to hide.
- **Example Value**: `/en/workwear/contact`

### Icon
- **Field Type**: Image
- **Required**: No
- **Repeating**: No
- **Notes**: Optional 32px icon displayed alongside the teaser label; defaults to phone glyph when omitted.
- **Example Value**: `media library/Icons/phone-white.svg`

### Theme
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Selects background color variant (`red`, `dark`, `light`) to match page theme.
- **Example Value**: `Red`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div id="block-stickycontactbar" class="block block-cws-sticky-contact-bar">`

## Notes
- Component stays hidden until user scrolls past the hero; it anchors to the lower-right corner on desktop and bottom bar on mobile.
- Expanded panel closes on outside click or ESC key; ensure tel link is keyboard accessible.
- Keep phone numbers localized per site language and verify they include country code for international visitors.

