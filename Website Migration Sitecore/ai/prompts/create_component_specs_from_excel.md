# Component Specification Generation Task

## Overview

Generate 41 component specification markdown files from an Excel spreadsheet, following existing spec patterns and Sitecore field type conventions.

## Input Files

- **Source Data**: `ai/prompts/component_specs/input/Component_Matrix.xlsx` (first sheet only)
- **Reference Specs**:
  - `ai/prompts/component_specs/accordion.md`
  - `ai/prompts/component_specs/IndustryCard.md`
- **Instructions**: `ai/prompts/create_component_requirements.md`

## Excel Column Mapping

- **Component Name**: Use 'Component' column
- **Sample URLs**: Use 'Sample URLs of Component' column
- **HTML Selector**: Use 'Component ID' (preferred) OR 'Component Class' (fallback)
- **Field Suggestions**: Use 'Fields' columns as starting point (validate and enhance)

## Requirements

### Component Analysis

1. **Fetch live HTML**: Visit each sample URL to extract actual component markup
2. **Locate component**: Use Component ID first; fall back to Component Class if ID unavailable
3. **Field validation**:
   - Cross-reference suggested fields with actual HTML structure
   - Add any missing fields found in markup
   - Ensure all fields use appropriate Sitecore field types
   - Verify field naming follows Sitecore conventions

### Sitecore Field Types

Use appropriate types such as:

- Single-Line Text
- Rich Text
- Image
- General Link
- Checkbox
- Date
- Multilist
- Droplink
- Number

### Output Specifications

- **Location**: Save all files to `ai/prompts/component_specs/`
- **Naming**: Use component name from 'Component' column (sanitized for filesystem)
- **Format**: Follow structure of reference markdown files exactly
- **Count**: Must produce exactly 42 spec files

## Execution Strategy

- **Parallel processing**: Use subagents to process multiple components simultaneously
- **Context management**: Each subagent should handle a subset of components to avoid context overflow
- **Suggested approach**: Process in batches of 5-10 components per subagent

## Quality Checks

Before proceeding, verify:

- [ ] Can access and read the Excel file
- [ ] Can access reference markdown files
- [ ] Can access instruction document
- [ ] Output directory exists or can be created
- [ ] Sample URLs are accessible

## Questions to Confirm

1. Should I validate that all 42 components from the spreadsheet are accounted for?
2. What should I do if a sample URL is inaccessible or component markup cannot be found?
3. Should I create a summary report of all generated specs?
4. Any specific field naming conventions beyond standard Sitecore best practices?
