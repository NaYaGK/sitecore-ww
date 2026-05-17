# Requirements

## Name
Footer

## Description
Primary solution-area footer displayed at the bottom of landing pages. Provides direct contact details, social network links, multi-column navigation lists, and dedicated press/PR contact blocks. Supports localized content while preserving a shared layout across solution areas.

## Fields

### Contact Phone Number
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Enter the main phone number shown in the contact banner; include country code and spacing consistent with local conventions.
- **Example Value**: `+49 211 875 398 420`

### Contact Email
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Author-provided email address rendered as a clickable link; use a plain email string (`info@cws.com`).
- **Example Value**: `healthcare@cws.com`

### Contact Hours
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Describes the availability window displayed under the phone/email details.
- **Example Value**: `Mon–Fri, 08:00–17:00`

### Social Links
- **Field Type**: Multilist (Social Link Item)
- **Required**: No
- **Repeating**: Yes
- **Notes**: Displays social icons with links next to the contact block; ordering matches author selection.
- **Example Value**: LinkedIn, YouTube

#### Social Link Item Fields:
- **Destination**: General Link - URL of the social profile; support external links only.
- **Icon**: Image - Square SVG/PNG icon rendered at 24px; use brand-compliant glyphs.
- **Accessible Label**: Single-Line Text - Optional override for screen readers (defaults to link host if blank).

### Footer Link Columns
- **Field Type**: Treelist (Footer Link Group)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Powers the multi-column lists shown below the contact block; each group renders a heading with associated links.
- **Example Value**: Customer Service, Downloads, About CWS

#### Footer Link Group Fields:
- **Group Title**: Single-Line Text - Column heading displayed above links.
- **Primary Links**: Multilist (Footer Link Item) - Ordered list of first-level links within the column.
- **Child Links**: Multilist (Footer Link Item) - Optional secondary links rendered as indented items beneath the parent list.

##### Footer Link Item Fields:
- **Link Text**: Single-Line Text - Visible text for the link.
- **Link Target**: General Link - Destination URL or internal page.
- **Open In New Window**: Checkbox - Select for external resources.

### Press Contacts
- **Field Type**: Multilist (Contact Person Item)
- **Required**: No
- **Repeating**: Yes
- **Notes**: Populates the press contacts column with team members including names and emails.
- **Example Value**: `Anna Müller – anna.mueller@cws.com`

### PR Contacts
- **Field Type**: Multilist (Contact Person Item)
- **Required**: No
- **Repeating**: Yes
- **Notes**: Optional list for PR-specific representatives; displays beneath the press contacts block when populated.
- **Example Value**: `PR Team – pr@cws.com`

#### Contact Person Item Fields:
- **Name**: Single-Line Text - Contact’s full name or team label.
- **Email**: General Link - `mailto:` link for direct outreach.
- **Phone Number**: Single-Line Text - Optional direct line for the individual.
- **Role Label**: Single-Line Text - Optional description such as “Press Officer”.

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="solution-area-footer">`

## Notes
- Layout renders as two-row block: top row for contact information, bottom row for navigation and press/PR sections.
- Ensure social links are configured for the correct language context; icons inherit accent color on hover.
- Mobile view collapses columns into accordions, so keep link group titles concise for small screens.

