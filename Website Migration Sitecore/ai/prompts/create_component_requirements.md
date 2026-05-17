Create a Sitecore component requirements document in markdown format by analyzing the provided webpage component. Your document should provide a high-level specification that a coding agent can use to locate and analyze the component independently.

Save the requirements document in the `ai/prompts/component_specs/IndustryCard.md` folder.

## Instructions

1. **Browse the referenced webpage** to examine the component structure and functionality
2. **Identify the component pattern** (accordion, carousel, card grid, etc.)
3. **Document high-level requirements only** - provide just enough detail for another agent to:
   - Locate the exact component on the page
   - Understand its purpose and behavior
   - Know what Sitecore fields need to be created
4. **Do NOT include** exhaustive content details, all text samples, or implementation code
5. **Focus on structure** rather than specific content

## Required Document Format

# Requirements

## Name
IndustryCard

## Description
[2-3 sentences describing:
- What the component does
- Key visual/interactive features
- Primary user interactions]

## Fields

[For each Sitecore field, document:]

### [Field Name]
- **Field Type**: [Single-Line Text | Multi-Line Text | Rich Text | Image | General Link | Checkbox | Droplink | Multilist | Treelist | etc.]
- **Required**: [Yes | No]
- **Repeating**: [Yes | No] (if part of a repeating item)
- **Notes**: [Any validation, defaults, or special considerations]
- **Example Value**: [Brief example to illustrate expected format]

[If the component has repeating items (like accordion panels, carousel slides), structure as:]

### [Collection Field Name]
- **Field Type**: [Multilist | Treelist]
- **Required**: Yes
- **References**: [Item Template Name]

#### [Item Template Name] Fields:
- **[Field Name]**: [Field Type] - [Description]
- **[Field Name]**: [Field Type] - [Description]

## Example Reference
* **URL**: https://www.cws.com/en/workwear/sectors
* **Element**: <div class="paragraph paragraph--type--teaser has-image">


## Notes
[Any additional context about variants, responsive behavior, or dependencies]