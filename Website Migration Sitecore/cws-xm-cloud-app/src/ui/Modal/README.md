# Modal System

A comprehensive, application-level modal dialog system. This system modal can be triggered from any page in the application.

Read the exiting code , we are already using the different forms from sitecore in the app. Forms are added as xmcloud components Headless frontend is using it properly. it is working perfectly. we have already displayed it in the multiple places. we can use the heroform form in the modal to test..SO use the same flow. Ideally, editors attached the modalform, which wont be visible by default. it is visible only when the associated button (contact button) is clicked.
Dont try to use directly sitecore forms. Use only the above mentioned flow which is simeple.

## Sitecore contact form modal requirements

This section captures the requirements and best-practice architecture for integrating the Sitecore XM Cloud contact form into the modal system.

### Goal

When the user clicks the Header "Contact" button (desktop and mobile), open a modal and render the same Sitecore XM Cloud contact form that appears on the home page hero banner.

### Analysis

Read the exiting code , we are already using the different forms from sitecore in the app. Forms are added as xmcloud components Headless frontend is using it properly. it is working perfectly. we have already displayed it in multiple places. we can use the same flow as heroform .SO use the same flow. Ideally, editors attached the form from sitecore forms in page builder.we have to add the styles such that it wont be visible by default. it is visible only when the associated button (contact button) is clicked. So in clientside, for this modal we ll add tthe styles for visibility.

Dont use directly sitecore forms library. Use only the above mentioned flow which is simeple.

### Form

- **Source of truth**: Sitecore XM Cloud (do not hardcode the form HTML)

### Critical requirement (works on all pages)

This implementation uses the existing form DOM already rendered on the page.
Because of that, it only works on pages where the Sitecore form is already present in the DOM.

Because of that:

- The form must already exist in the DOM (e.g. the hero banner form).
- Clicking Contact toggles a global CSS class that turns the existing form into a modal.

### UX and accessibility requirements

- **Trigger points**
  - Desktop header contact button
  - Mobile menu fixed contact button
- **No navigation**
  - Clicking contact must open the modal, not navigate to `/en/workwear/contact`.
- **Button styling**
  - Do not change the existing contact button classes/styles.

## Best practices (Sitecore XM Cloud + Next.js)

Dont use import { SitecoreForm } from 'src/components/SitecoreForm/SitecoreForm' or anyother sitecore libraries

### Implementation approach (Option 2)

- The contact button calls `openContactFormModal()`.
- This toggles `body.cws-contact-form-modal-open`.
- CSS targets `form[data-formid="32337697abb5491ca8f64104b9e569bc-euw"]` and repositions it as a centered modal.
- `ContactFormModalController` renders the overlay and handles ESC / close.

## Notes

- This approach is DOM-based and intentionally avoids rendering Sitecore form components inside the modal.
- If you need "works on all pages" later, you will need a different approach.
