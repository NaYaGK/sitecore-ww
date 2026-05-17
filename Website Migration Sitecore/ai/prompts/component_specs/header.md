# Requirements

## Name
Header

## Description
Global masthead that anchors the brand logo, language selector, and primary navigation. On desktop it renders a wide horizontal menu with mega-menu flyouts, while on smaller breakpoints it collapses to a hamburger-triggered drawer. Provides quick access to top-level solution areas and utility links across the site.

## Fields

### Logo
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: Upload an SVG or high-resolution PNG of the CWS logotype; author must provide descriptive alt text for accessibility.
- **Example Value**: `media library/Master/Logos/CWS.svg`

### Language Drawer
- **Field Type**: Droplink
- **Required**: No
- **Repeating**: No
- **Notes**: References the reusable language selector component rendered near the utility icons; leave empty to hide the language switcher.
- **Example Value**: `/sitecore/content/CWS/Shared/Language Drawer`

### Top Navigation Items
- **Field Type**: Multilist (Navigation Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Controls the ordered list of top-level links displayed across the header bar; items should represent major solution areas.
- **Example Value**: Workwear, Hygiene, Cleanrooms

#### Navigation Item Fields:
- **Menu Title**: Single-Line Text - Visible label for the top navigation item.
- **Destination**: General Link - Target URL or internal item for the menu title.
- **External Target**: Checkbox - Mark when linking to an external destination to add `target="_blank"`.

### Menu Navigation
- **Field Type**: Treelist (Mega Menu Group)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Supplies grouped column content for the mega-menu flyouts shown when hovering or tapping a top navigation item; maintain parity between top-level items and groups.
- **Example Value**: Workwear Services

#### Mega Menu Group Fields:
- **Group Title**: Single-Line Text - Column heading within the mega menu.
- **Intro Copy**: Rich Text - Optional short description displayed beneath the heading.
- **Links**: Multilist (Mega Menu Link) - Ordered list of deeplink destinations for the column.

##### Mega Menu Link Fields:
- **Link Text**: Single-Line Text - Display text for the sub-link.
- **Link Target**: General Link - Destination for the sub-link; supports internal items and external URLs.
- **Highlight State**: Checkbox - Marks the link as emphasized (e.g., bold or accent color).

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="header-menu-wrapper">`

## Notes
- Header becomes sticky after scroll and shrinks height while keeping the mega menu accessible.
- Mobile layout replaces the top navigation with a hamburger menu that expands the same data source.
- Ensure hover, focus, and ARIA menu attributes remain intact so nested navigation remains keyboard accessible.

