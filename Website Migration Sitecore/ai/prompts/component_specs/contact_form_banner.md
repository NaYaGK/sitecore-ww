# Requirements

## Name
Contact Form Banner

## Description
Full-width call-to-action banner inviting visitors to make contact. Combines a short value proposition, a prominent CTA button that launches a modal form, and an optional phone number for direct calls. Typically positioned near the bottom of solution pages as a final conversion prompt.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Bold heading displayed on the left side of the banner; keep under 60 characters.
- **Example Value**: `Ready to optimise your workwear service?`

### Description
- **Field Type**: Multi-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Supportive copy (1–2 sentences) explaining the benefit of contacting the team.
- **Example Value**: `Request a free consultation with one of our specialists today.`

### Primary CTA
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Button that opens the contact form in a modal or navigates to a contact page; configure as internal link when possible.
- **Example Value**: `/en/workwear/contact-form`

### Phone Number
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional hotline shown alongside the CTA; rendered as a `tel:` link.
- **Example Value**: `+49 211 875 398 420`

### Background Theme
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Determines banner color variant (e.g., `red`, `dark`, `white`); defaults to red when not set.
- **Example Value**: `Dark`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--contact-form-banner">`

## Notes
- CTA button triggers the shared modal component; ensure linked form is mobile friendly and translated for locale.
- Phone number is optional but recommended for markets where phone contact is preferred.
- Banner spans edge-to-edge, so avoid long sentences that could wrap awkwardly on smaller screens.

