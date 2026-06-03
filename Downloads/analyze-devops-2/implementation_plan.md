# Implementation Plan - Collapsible Note Topic Dropdowns

Add collapsible, interactive sections (accordions) for each main study topic in `NotesView.tsx` to optimize the reading experience on both web browsers and mobile APK layouts.

## User Review Required

> [!IMPORTANT]
> **Collapsible Default Behavior**:
> By default, all sections will start **collapsed** when switching days. This allows users on mobile and web to quickly scan the structure of the day. However:
> 1. Clicking any link in the sidebar or mobile drop-down menu will **automatically expand** the target section and scroll to it.
> 2. We will add an **"Expand All / Collapse All"** button bar at the top of the day notes, allowing users to toggle all sections at once.

## Proposed Changes

### [Component: Notes View & Styling]

#### [MODIFY] [notes.css](file:///Users/karthikganji/Downloads/analyze-devops-2/v2-90day-devops-new-main/src/css/notes.css)
- Add CSS rules for `.collapsible-section`, `.collapsible-header`, `.collapsible-wrapper`, and `.collapsible-content`.
- Use a modern CSS Grid transition (`grid-template-rows: 0fr` to `1fr`) to animate the expansion of height smoothly without hardcoding values or causing visual artifacts.
- Style the header button with hover highlights, rotating chevron animations, and color borders based on the day's theme color variable `--section-color`.

#### [MODIFY] [NotesView.tsx](file:///Users/karthikganji/Downloads/analyze-devops-2/v2-90day-devops-new-main/src/views/NotesView.tsx)
- Define `expandedSections` state: `Record<string, boolean>` tracking open/collapsed state of:
  - `schedule`, `concepts`, `commands`, `debug`, `mistakes`, `project`, `interview`, `quiz`, `github`.
- Create a `CollapsibleSection` component that wraps sections with headers and handles toggling.
- Implement helper functions:
  - `toggleSection(sectionId)` to toggle a specific section.
  - `setAllSections(isOpen: boolean)` to expand/collapse all sections.
- Update `handleScrollTo` to make sure the target section is set to open (`true` in state) before scrolling.
- Reset the expanded state or set it to all-collapsed (or keep user choices) when switching days.
- Wrap all 9 topic blocks in `NotesView.tsx` with the new component and clean up duplicate `h3` tags.
- Insert the "Expand All / Collapse All" button bar below the Day Goal callout card.

---

## Verification Plan

### Automated Tests
- Run `npx tsc --noEmit` to ensure type safety.

### Manual Verification
- **Desktop/Web Viewport**: Test clicking sidebar navigation links. Ensure sections expand and scroll smoothly. Test manual header clicks and "Expand/Collapse All" buttons.
- **Mobile/APK Viewport**: Test using the browser subagent in a narrow viewport. Verify that the mobile dropdown select menu successfully expands and scrolls to sections.
