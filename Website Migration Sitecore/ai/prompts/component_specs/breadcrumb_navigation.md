# Requirements

## Name
Breadcrumb Navigation

## Description
Hierarchical breadcrumb trail displayed beneath the hero to help users understand site position. Shows the current page alongside its ancestor pages, each linked for quick navigation. Automatically generated from the page tree but supports manual overrides for bespoke landing paths.

## Fields

### Breadcrumb Items
- **Field Type**: Treelist (Breadcrumb Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of ancestor and current page entries; defaults can be auto-populated from the content tree.
- **Example Value**: Home, Workwear, Products

#### Breadcrumb Item Fields:
- **Label**: Single-Line Text - Display name for the breadcrumb entry.
- **Destination**: General Link - Target URL; leave blank for the current page.
- **Is Current Page**: Checkbox - Flags the terminal breadcrumb; disables the link state when checked.

## Example Reference
* **URL**: https://www.cws.com/en/workwear/products
* **Element**: `<div id="block-breadcrumbs-3" class="block block-system">`

## Notes
- Do not exceed four levels to maintain layout; truncate deeper paths by hiding middle entries as needed.
- Component suppresses itself on the homepage and any page configured as the site root.
- Breadcrumbs assist with SEO—ensure label text mirrors the target page title or configured navigation title.

