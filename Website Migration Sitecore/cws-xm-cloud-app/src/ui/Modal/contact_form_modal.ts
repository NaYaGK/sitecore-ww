type Listener = () => void;

const BODY_OPEN_CLASS = 'cws-contact-form-modal-open';
const DEFAULT_FORM_ID = 'dce80143d166463b99d2feadf676885f-euw';

let isOpen = false;
let currentFormId: string | null = null;
let scrollPosition = 0;
const listeners = new Set<Listener>();

const notify = (): void => {
  listeners.forEach((l) => l());
};

export const getIsContactFormModalOpen = (): boolean => {
  if (typeof document === 'undefined') return false;
  return document.body.classList.contains(BODY_OPEN_CLASS);
};

export const getCurrentFormId = (): string | null => {
  return currentFormId;
};

export const subscribeToContactFormModal = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const openContactFormModal = (formId?: string): void => {
  if (typeof document === 'undefined') return;

  currentFormId = formId || DEFAULT_FORM_ID;

  // Contact form identifier - matches formHiddenFields.ts
  const CONTACT_FORM_IDENTIFIER = 'input[name="name"][data-prefill="contact_pop_up"]';

  let targetForm: HTMLFormElement | null = null;

  // 1. Try :has() selector with contact identifier
  targetForm = document.querySelector<HTMLFormElement>(`form:has(${CONTACT_FORM_IDENTIFIER})`);

  // 2. Manual search through all forms (fallback for browsers without :has() support)
  if (!targetForm) {
    const allForms = document.querySelectorAll<HTMLFormElement>('form');
    for (const form of allForms) {
      if (form.querySelector(CONTACT_FORM_IDENTIFIER)) {
        targetForm = form;
        break;
      }
    }
  }

  if (!targetForm) {
    return;
  }

  // Save current scroll position
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  document.body.classList.add(BODY_OPEN_CLASS);
  document.body.style.top = `-${scrollPosition}px`;
  isOpen = true;
  notify();

  window.setTimeout(() => {
    const focusTarget = targetForm?.querySelector<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
    );
    focusTarget?.focus?.();
  }, 0);
};

export const closeContactFormModal = (): void => {
  if (typeof document === 'undefined') return;

  document.body.classList.remove(BODY_OPEN_CLASS);
  document.body.style.top = '';
  isOpen = false;
  currentFormId = null;
  
  // Restore scroll position
  window.scrollTo(0, scrollPosition);
  
  notify();
};

export const toggleContactFormModal = (formId?: string): void => {
  if (typeof document === 'undefined') return;

  if (isOpen || getIsContactFormModalOpen()) {
    closeContactFormModal();
  } else {
    openContactFormModal(formId);
  }
};
