import { GA_ID } from '../GTM/gtm';

type HiddenFieldFillResult = {
  formId: string | null;
  filled: Record<string, string>;
};

const FORM_SELECTOR = 'form[data-formid]';
// Hero form is identified by a text input with name="name" and data-prefill="hero"
const HERO_FORM_IDENTIFIER_SELECTOR = 'input[name="name"][data-prefill="hero"]';
// Contact form is identified by an input with name="name" and data-prefill="contact_pop_up"
const CONTACT_FORM_IDENTIFIER_SELECTOR = 'input[name="name"][data-prefill="contact_pop_up"]';

const detectAndMarkHeroForms = (): void => {
  // Find all forms that contain the hero identifier input field
  const heroForms = document.querySelectorAll<HTMLFormElement>(
    `form:has(${HERO_FORM_IDENTIFIER_SELECTOR})`,
  );

  heroForms.forEach((form) => {
    if (!form.dataset.formname) {
      form.dataset.formname = 'hero';
    }

    const wrapper = form.closest<HTMLElement>('.main-form-wrapper');
    if (wrapper && !wrapper.dataset.formname) {
      wrapper.dataset.formname = 'hero';
    }
  });

  // Fallback: if :has() not supported, use manual search
  if (heroForms.length === 0) {
    const allForms = document.querySelectorAll<HTMLFormElement>('form');

    allForms.forEach((form) => {
      if (form.querySelector(HERO_FORM_IDENTIFIER_SELECTOR)) {
        if (!form.dataset.formname) {
          form.dataset.formname = 'hero';
        }

        const wrapper = form.closest<HTMLElement>('.main-form-wrapper');
        if (wrapper && !wrapper.dataset.formname) {
          wrapper.dataset.formname = 'hero';
        }
      }
    });
  }
};

const detectAndMarkContactForms = (): void => {
  // Contact forms are identified by data-prefill attribute only
  // No need to set data-formname - CSS uses :has() selector directly
  // This function is kept for potential future use but does nothing now
};

const generateTransactionId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // ignore
  }
  // Fallback: timestamp + random suffix (non-cryptographic)
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const findInputByName = (form: HTMLFormElement, name: string): HTMLInputElement | null => {
  return form.querySelector<HTMLInputElement>(`input[name="${name}"]`);
};

const setFieldValue = (
  form: HTMLFormElement,
  fieldName: string,
  value: string,
  forceOverwrite: boolean = false,
): boolean => {
  if (!value && !forceOverwrite) return false;

  const input = findInputByName(form, fieldName);
  if (!input) return false;

  if (!forceOverwrite && input.value.trim()) return false;

  input.value = value;
  input.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
};

// ========================================
// EXTRACT COUNTRY CODE FROM LOCALE
// ========================================

const getCountryCodeFromLocale = (url: URL | null): string => {
  // Fallback: derive from URL path
  if (url) {
    const pathSegments = url.pathname.split('/').filter((s) => s);
    if (pathSegments.length > 0 && pathSegments[0]) {
      const localeMatch = pathSegments[0].match(/([a-z]{2})-([a-z]{2})/i);
      if (localeMatch && localeMatch[2]) {
        return localeMatch[2].toUpperCase(); // Return country part (e.g., "BE" from "nl-BE")
      }
    }
  }

  return 'US'; // Default country code
};

export const fillHiddenFieldsForForm = (form: HTMLFormElement): HiddenFieldFillResult => {
  const formId = form.getAttribute('data-formid');

  let url: URL | null = null;
  try {
    url = new URL(window.location.href);
  } catch {
    url = null;
  }

  const filled: Record<string, string> = {};

  // Prepare data sources
  const currentUrl = window.location.href;
  const docReferrer = document.referrer || '';

  // Add this in the fillHiddenFieldsForForm function after the language extraction section:
  const countryCode = getCountryCodeFromLocale(url);

  // ========================================
  // AUTO-POPULATED WITH JS FIELDS
  // ========================================

  // Core tracking fields (ALWAYS overwrite)
  if (setFieldValue(form, 'referrer', docReferrer, true)) filled['referrer'] = docReferrer;
  if (setFieldValue(form, 'source', currentUrl, true)) filled['source'] = currentUrl;
  if (setFieldValue(form, 'url', currentUrl, true)) filled['url'] = currentUrl;
  if (setFieldValue(form, 'country_code', countryCode, true)) filled['country_code'] = countryCode;

  // GA Client ID - imported from GTM
  if (GA_ID) {
    if (setFieldValue(form, 'ga_client_id', GA_ID, true)) filled['ga_client_id'] = GA_ID;
  }

  // Campaign ID - from Layout.tsx global variable
  const campaignId = (window as any).CWS_CAMPAIGN_ID;
  if (campaignId && setFieldValue(form, 'campaign', campaignId, true)) {
    filled['campaign'] = campaignId;
  }

  // ========================================
  // HARDCODED VALUES IN BROWSER
  // ========================================

  // Form transaction ID - auto-generated
  const txnId = generateTransactionId();
  if (setFieldValue(form, 'form_transaction_id', txnId, false))
    filled['form_transaction_id'] = txnId;

  // ========================================
  // EXTRACT LANGUAGE FROM URL PATH
  // ========================================

  if (url) {
    const pathSegments = url.pathname.split('/').filter((s) => s);
    let language = 'en'; // default

    if (pathSegments.length > 0 && pathSegments[0]) {
      const firstSegment = pathSegments[0].toLowerCase();
      if (firstSegment === 'de' || firstSegment === 'en' || firstSegment === 'fr') {
        language = firstSegment;
      } else if (pathSegments.length > 1 && pathSegments[1]) {
        const secondSegment = pathSegments[1].toLowerCase();
        if (secondSegment === 'de' || secondSegment === 'en' || secondSegment === 'fr') {
          language = secondSegment;
        }
      }
    }

    // Format as locale codes
    if (language === 'de') language = 'de-DE';
    else if (language === 'en') language = 'en-GB';
    else if (language === 'fr') language = 'fr-FR';

    if (setFieldValue(form, 'language', language, false)) filled['language'] = language;
  }

  // ========================================
  // EXTRACT PRODUCT ID & NAME FROM PDP
  // ========================================

  if (url) {
    const pathSegments = url.pathname.split('/').filter((s) => s);
    const pIndex = pathSegments.findIndex((s) => s === 'p');

    if (pIndex !== -1 && pathSegments[pIndex + 1]) {
      const productId = pathSegments[pIndex + 1];
      if (productId) {
        if (setFieldValue(form, 'productid', productId, false)) filled['productid'] = productId;
      }

      // Product name from page title
      const pageTitle = document.title;
      if (pageTitle && pageTitle.trim()) {
        if (setFieldValue(form, 'productname', pageTitle.trim(), false))
          filled['productname'] = pageTitle.trim();
      }
    }
  }

  // ========================================
  // URL PARAMETERS
  // ========================================

  if (url) {
    url.searchParams.forEach((value, key) => {
      const trimmed = value.trim();
      if (trimmed) {
        if (setFieldValue(form, key, trimmed, false)) filled[key] = trimmed;
      }
    });
  }

  // ========================================
  // COPY CAMPAIGN TO CAMPAIGN_ID
  // ========================================

  const campaignInput = findInputByName(form, 'campaign');
  if (campaignInput && campaignInput.value.trim()) {
    const campaignValue = campaignInput.value.trim();
    if (setFieldValue(form, 'campaign_id', campaignValue, false))
      filled['campaign_id'] = campaignValue;
  }

  return { formId, filled };
};

export const fillHiddenFields = (target?: string | HTMLFormElement): HiddenFieldFillResult[] => {
  if (typeof window === 'undefined') return [];

  if (target instanceof HTMLFormElement) {
    return [fillHiddenFieldsForForm(target)];
  }

  if (typeof target === 'string' && target.trim()) {
    const el = document.querySelector(target);
    if (el instanceof HTMLFormElement) {
      return [fillHiddenFieldsForForm(el)];
    }
    return [];
  }

  const forms = document.querySelectorAll<HTMLFormElement>(FORM_SELECTOR);
  return Array.from(forms).map((form) => fillHiddenFieldsForForm(form));
};

export const logHiddenFieldsBeforeSubmit = (
  form: HTMLFormElement,
  result: HiddenFieldFillResult,
): void => {
  // Reserved for debugging - can be enabled when needed
};

export const initGlobalFormHiddenFieldFiller = (): void => {
  if (typeof window === 'undefined') return;

  // Guard: init only once
  if ((window as any).__cwsHiddenFieldsInit) return;
  (window as any).__cwsHiddenFieldsInit = true;

  // Detect and mark hero and contact forms immediately on page load
  try {
    detectAndMarkHeroForms();
    detectAndMarkContactForms();
  } catch (error) {
    console.error('[CWSForms] Error in form detection:', error);
  }

  // Watch for dynamically added forms (e.g., Sitecore Forms loaded via script)
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.tagName === 'FORM' || node.querySelector('form')) {
            shouldCheck = true;
          }
        }
      });
    });

    if (shouldCheck) {
      detectAndMarkHeroForms();
      detectAndMarkContactForms();
    }
  });

  // Start observing the document for form additions
  try {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error('[CWSForms] Error starting MutationObserver:', error);
  }

  // Global API
  const w = window as unknown as {
    CWSForms?: {
      fillHiddenFields?: typeof fillHiddenFields;
      fillHiddenFieldsForForm?: typeof fillHiddenFieldsForForm;
      logHiddenFieldsBeforeSubmit?: typeof logHiddenFieldsBeforeSubmit;
    };
  };

  w.CWSForms = w.CWSForms || {};
  w.CWSForms.fillHiddenFields = fillHiddenFields;
  w.CWSForms.fillHiddenFieldsForForm = fillHiddenFieldsForForm;
  w.CWSForms.logHiddenFieldsBeforeSubmit = logHiddenFieldsBeforeSubmit;

  // Fill hidden fields on submit button click (before Sitecore's submit handling)
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      const submitBtn = target.closest(
        'button[type="submit"], input[type="submit"], button:not([type]), [data-submit]',
      );
      if (!submitBtn) return;

      const form = submitBtn.closest(FORM_SELECTOR) as HTMLFormElement | null;
      if (!form) return;

      // Re-fill to ensure values are current
      fillHiddenFieldsForForm(form);
    },
    true, // Capture phase - runs BEFORE any other handlers
  );
};
