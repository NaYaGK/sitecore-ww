# Component Generation from Specifications Task

## Overview
Generate component implementations for all specification files, using a template-based approach with parallel processing for efficiency.

## Input Files
- **Specifications Directory**: `ai/prompts/component_specs/` (all `.md` files)
- **Component Template**: `ai/prompts/create_component.md`
- **Template Variables**:
  - `{COMPONENT_SPEC_PATH}` - Full path to the spec file
  - `{COMPONENT_NAME}` - Component name extracted from spec

## Component Name Extraction
Extract component name using this priority order:
1. **From filename**: Use the spec filename without `.md` extension (e.g., `accordion.md` → `accordion`)
2. **From spec content**: If filename is generic, extract from first heading or component name field in spec
3. **Sanitization**: Convert to PascalCase for component names (e.g., `industry-card` → `IndustryCard`)

## Processing Strategy

### Execution Approach
- **Sequential validation**: Process specs one by one to track progress
- **Parallel generation**: Use multiple subagents to generate actual components simultaneously
- **Batch size**: Process 5-8 components per subagent to optimize context usage
- **Progress tracking**: Log completion status after each batch

### Recommended Workflow
```
1. Scan component_specs folder → Get list of all .md files
2. Validate each spec can be read → Create processing queue
3. Divide queue into batches → Assign to subagents
4. Each subagent:
   a. Read component template
   b. For each spec in batch:
      - Extract component name
      - Read spec content
      - Substitute template variables
      - Generate component files
      - Validate output
   c. Report batch completion
5. Aggregate results → Generate summary report
```

## Template Substitution

### Variables to Replace
```markdown
{COMPONENT_SPEC_PATH} → Full absolute or relative path to spec file
                        Example: ai/prompts/component_specs/accordion.md

{COMPONENT_NAME} → PascalCase component name
                   Example: Accordion, IndustryCard, NavigationMenu
```

### Additional Context
- Preserve all other content from `create_component.md` template
- Follow any instructions within the template itself
- Maintain consistent formatting and structure

## Output Requirements

### Component Files
For each spec, generate appropriate component files based on template instructions:
- Expected output location: (specify or infer from template)
- Expected file structure: (specify or infer from template)
- Naming conventions: Follow template guidance

### Directory Structure
```
(Specify expected output directory structure)
Example:
components/
  ├── Accordion/
  │   ├── Accordion.tsx
  │   ├── Accordion.module.css
  │   └── index.ts
  ├── IndustryCard/
  │   ├── IndustryCard.tsx
  │   ├── IndustryCard.module.css
  │   └── index.ts
  ...
```

## Error Handling

### Spec File Issues
- **Missing spec**: Log warning, continue with next
- **Malformed spec**: Log error with details, skip component
- **Unreadable file**: Log error, continue processing

### Generation Issues
- **Template error**: Log details, attempt to continue
- **File write error**: Log error, retry once, then skip
- **Validation failure**: Log warnings, mark for review

### Logging Requirements
Create `component_generation_log.md` with:
```markdown
# Component Generation Log

## Summary
- Total specs found: [count]
- Successfully generated: [count]
- Failed: [count]
- Skipped: [count]

## Detailed Results
| Component Name | Status | Notes |
|----------------|--------|-------|
| Accordion | ✓ Success | - |
| IndustryCard | ✓ Success | - |
| BrokenSpec | ✗ Failed | Missing required field |
...

## Errors
(List all errors with details)
```

## Parallel Processing Configuration

### Subagent Distribution
- **Total specs**: 42 (expected)
- **Subagent count**: 6-8 recommended
- **Batch size**: ~5-7 specs per subagent
- **Context management**: Each subagent works independently with minimal shared context

### Coordination Strategy
```
Main Agent:
├─ Subagent 1: specs 1-6
├─ Subagent 2: specs 7-12
├─ Subagent 3: specs 13-18
├─ Subagent 4: specs 19-24
├─ Subagent 5: specs 25-30
├─ Subagent 6: specs 31-36
└─ Subagent 7: specs 37-42
```

## Pre-Execution Validation

Before starting, verify:
- [ ] Can access `ai/prompts/component_specs/` directory
- [ ] Can read all `.md` files in the directory
- [ ] Can read `ai/prompts/create_component.md` template
- [ ] Output directory exists or can be created
- [ ] Template contains `{COMPONENT_SPEC_PATH}` and `{COMPONENT_NAME}` placeholders
- [ ] Understand component generation requirements from template

## Post-Execution Deliverables

### Required Outputs
1. All generated component files (in appropriate directories)
2. `component_generation_log.md` (detailed log)
3. Summary report with statistics and any issues

### Summary Report Format
```markdown
# Component Generation Summary

## Statistics
- Specs processed: [X]/42
- Components generated: [X]
- Success rate: [X]%
- Total time: [duration]

## Status by Component
(Link to detailed log)

## Issues Requiring Attention
(List any components that need manual review)

## Next Steps
(Suggest any follow-up actions)
```

## Answers to questions you might have as you go

1. **Output location**: See `ai/prompts/create_component.md`
2. **File structure**: See `ai/prompts/create_component.md`
3. **Overwrite policy**: Existing components should be skipped
4. **Validation**: Yes, generated components should be validated (linting, type checking)
5. **Framework**: Next.js, TypeScript, Storybook
6. **Naming convention**: PascalCase for component names?

