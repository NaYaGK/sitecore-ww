import { fillHiddenFieldsForForm } from './formHiddenFields';

type InterceptorCallbacks = {
  onSuccess: (title?: string, message?: string) => void;
  onError: (title?: string, message?: string) => void;
};

const FORM_SELECTOR = 'form[data-formid]';

/**
 * Intercepts Sitecore form submissions and replaces default popups with custom dialogs.
 * Uses MutationObserver and polling to detect when Sitecore shows success/error popups,
 * then hides them and triggers custom callbacks.
 */
export class SitecoreFormInterceptor {
  private callbacks: InterceptorCallbacks;
  private successEl: HTMLElement | null = null;
  private failEl: HTMLElement | null = null;
  private successObserver: MutationObserver | null = null;
  private failObserver: MutationObserver | null = null;
  private popupObserver: MutationObserver | null = null;
  private formObserver: MutationObserver | null = null;
  private lastSuccessDisplay: string = '';
  private lastFailDisplay: string = '';
  private isDestroyed = false;
  private pollingIntervalId: number | null = null;
  private formSubmitHandlers = new Map<HTMLFormElement, EventListener>();
  private processingForms = new WeakSet<HTMLFormElement>();
  private pendingResetForms = new Set<HTMLFormElement>();
  private lastSubmittedForm: HTMLFormElement | null = null;

  constructor(callbacks: InterceptorCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Extracts message text from a Sitecore popup element.
   * @param element - The popup element to extract text from
   * @returns The extracted and cleaned message text
   */
  private extractMessage(element: HTMLElement): string {
    try {
      // Try to get text from h4, p, or any text content
      const h4 = element.querySelector('h4');
      const p = element.querySelector('p');
      const textEl = h4 || p || element;

      // Get text content and clean it up
      let text = textEl.textContent || textEl.innerText || '';
      text = text.trim().replace(/\s+/g, ' ');

      return text;
    } catch (e) {
      return '';
    }
  }

  private resetSingleForm(form: HTMLFormElement) {
    try {
      form.reset();

      form.querySelectorAll('.form-input-wrapper-element.has-error').forEach((wrapper) => {
        wrapper.classList.remove('has-error');
      });

      form.querySelectorAll('.cws-error-container').forEach((container) => {
        (container as HTMLElement).textContent = '';
      });

      form.querySelectorAll('.form-input-error-message, .field-validation-error').forEach((msg) => {
        if (msg instanceof HTMLElement) {
          msg.style.display = 'none';
          msg.style.visibility = 'hidden';
        }
      });

      form.querySelectorAll('.input-error, .error').forEach((input) => {
        input.classList.remove('input-error', 'error');
      });

      fillHiddenFieldsForForm(form);
    } catch {
      // no-op
    }
  }

  private markSubmittedForm(form: HTMLFormElement | null) {
    if (form) {
      this.lastSubmittedForm = form;
    }
  }

  private markFormForReset(form?: HTMLFormElement | null) {
    if (form) {
      this.pendingResetForms.add(form);
      return;
    }

    if (this.lastSubmittedForm) {
      this.pendingResetForms.add(this.lastSubmittedForm);
      return;
    }

    document.querySelectorAll<HTMLFormElement>(FORM_SELECTOR).forEach((f) => this.pendingResetForms.add(f));
  }

  private getActiveSubmitButton(form: HTMLFormElement): HTMLElement | null {
    const activeEl = document.activeElement;
    if (activeEl instanceof HTMLElement && form.contains(activeEl)) {
      const activeSubmit = activeEl.closest(
        '.submit-button, button[type="submit"], input[type="submit"], button:not([type])',
      );
      if (activeSubmit instanceof HTMLElement) {
        return activeSubmit;
      }
    }

    return form.querySelector<HTMLElement>(
      '.submit-button, button[type="submit"], input[type="submit"], button:not([type])',
    );
  }

  private hasInlineOnClick(submitButton: HTMLElement | null): boolean {
    if (!submitButton) return false;
    const maybeOnClick = (submitButton as HTMLButtonElement).onclick;
    return typeof maybeOnClick === 'function';
  }

  private reExecuteInlineSitecoreScript(form: HTMLFormElement): boolean {
    const formId = form.getAttribute('data-formid');
    const parent = form.parentElement;
    if (!parent) return false;

    const inlineScripts = Array.from(parent.querySelectorAll<HTMLScriptElement>('script:not([src])'));
    const targetScript = inlineScripts.find((script) => {
      const text = script.textContent || '';
      if (!text) return false;
      const hasSubmitBootstrap =
        text.includes('readyFormSubmit') ||
        text.includes('buttonCallback') ||
        text.includes('sitecore') ||
        text.includes('Sitecore');
      const hasFormReference = !!formId && text.includes(formId);
      return hasSubmitBootstrap && (hasFormReference || !formId);
    });

    if (!targetScript?.textContent) return false;

    try {
      const injected = document.createElement('script');
      injected.type = 'text/javascript';
      injected.text = targetScript.textContent;
      document.body.appendChild(injected);
      injected.remove();
      return true;
    } catch {
      return false;
    }
  }

  private ensureSubmitBinding(form: HTMLFormElement): boolean {
    const submitButton = this.getActiveSubmitButton(form);
    if (this.hasInlineOnClick(submitButton)) return true;

    const rebound = this.reExecuteInlineSitecoreScript(form);
    if (!rebound) return false;

    const reboundButton = this.getActiveSubmitButton(form);
    return this.hasInlineOnClick(reboundButton);
  }

  private extractRescueMessage(responseJson: unknown): string | undefined {
    if (!responseJson || typeof responseJson !== 'object') return undefined;
    const payload = responseJson as Record<string, unknown>;
    const message = payload.message || payload.Message || payload.error || payload.Error;
    return typeof message === 'string' && message.trim() ? message.trim() : undefined;
  }

  private buildRescuePayload(form: HTMLFormElement): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    const elements = form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input[name], textarea[name], select[name]',
    );

    elements.forEach((field) => {
      const name = field.name;
      if (!name) return;

      if (field instanceof HTMLInputElement) {
        const type = (field.type || '').toLowerCase();
        if (type === 'checkbox') {
          values[name] = field.checked;
          return;
        }

        if (type === 'radio') {
          if (field.checked) {
            values[name] = field.value;
          } else if (!(name in values)) {
            values[name] = '';
          }
          return;
        }

        if (type === 'file') {
          return;
        }
      }

      values[name] = field.value;
    });

    values.domain = window.location.hostname;
    return values;
  }

  private resolveRescueUrl(form: HTMLFormElement): string {
    const rawAction = (form.getAttribute('action') || '').trim();
    if (rawAction && rawAction !== '#') {
      try {
        return new URL(rawAction, window.location.origin).toString();
      } catch {
        // fall through
      }
    }

    const formId = form.getAttribute('data-formid') || '';
    const contextId =
      (window as any).SITECORE_EDGE_CONTEXT_ID ||
      (window as any).sitecoreContextId ||
      (window as any).__SITECORE_CONTEXT_ID ||
      '';

    if (formId && contextId) {
      return `https://edge-platform.sitecorecloud.io/v1/forms/data/${formId}?sitecoreContextId=${contextId}`;
    }

    return window.location.href;
  }

  private async submitRescueRequest(form: HTMLFormElement): Promise<{ ok: boolean; message?: string }> {
    const url = this.resolveRescueUrl(form);
    const payload = this.buildRescuePayload(form);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Data: JSON.stringify(payload) }),
    });

    let responseJson: unknown;
    try {
      responseJson = await response.json();
    } catch {
      responseJson = null;
    }

    const message = this.extractRescueMessage(responseJson);
    return { ok: response.ok, message };
  }

  public acknowledgeDialogAndResetForms() {
    if (this.pendingResetForms.size === 0 && this.lastSubmittedForm) {
      this.pendingResetForms.add(this.lastSubmittedForm);
    }

    this.pendingResetForms.forEach((form) => {
      if (document.contains(form)) {
        this.resetSingleForm(form);
      }
    });
    this.pendingResetForms.clear();
  }

  init() {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.isDestroyed) {
      return;
    }

    // Ensure any previous observers are disconnected
    this.successObserver?.disconnect();
    this.failObserver?.disconnect();

    // Permanently hide Sitecore popups via CSS to prevent flicker
    const STYLE_ID = 'cws-hide-sitecore-popups';
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        .message-popup.success-popup,
        .message-popup.fail-popup { display: none !important; visibility: hidden !important; }
      `;
      document.head.appendChild(style);
    }

    // Locate Sitecore success/fail popup elements
    this.successEl = document.querySelector<HTMLElement>('.message-popup.success-popup');
    this.failEl = document.querySelector<HTMLElement>('.message-popup.fail-popup');

    const getDisplay = (el: HTMLElement): string => {
      // IMPORTANT: Only check inline style, not computed style
      // Sitecore sets inline style.display = 'block' on submission
      // Our CSS has display: none !important which would override computed style
      const inline = (el.style.display || '').toLowerCase();
      return inline || 'none';
    };

    const hidePopup = (el: HTMLElement) => {
      try {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.setAttribute('aria-hidden', 'true');
      } catch {}
    };

    // Setup success popup observer
    const setupSuccessObserver = (element: HTMLElement) => {
      this.successEl = element;
      this.lastSuccessDisplay = '';
      // DON'T hide popup initially - we need to detect when Sitecore shows it

      this.successObserver?.disconnect();
      this.successObserver = new MutationObserver(() => {
        if (!this.successEl) return;
        const current = getDisplay(this.successEl);

        if (current === 'block' && this.lastSuccessDisplay !== 'block') {
          const message = this.extractMessage(this.successEl);
          hidePopup(this.successEl);
          this.lastSuccessDisplay = '';
          this.markFormForReset(this.lastSubmittedForm);
          this.callbacks.onSuccess(undefined, message || undefined);
        } else {
          this.lastSuccessDisplay = current;
        }
      });

      this.successObserver.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
      });
    };

    // Setup fail popup observer
    const setupFailObserver = (element: HTMLElement) => {
      this.failEl = element;
      this.lastFailDisplay = '';
      // DON'T hide popup initially - we need to detect when Sitecore shows it

      this.failObserver?.disconnect();
      this.failObserver = new MutationObserver(() => {
        if (!this.failEl) return;
        const current = getDisplay(this.failEl);

        if (current === 'block' && this.lastFailDisplay !== 'block') {
          const message = this.extractMessage(this.failEl);
          hidePopup(this.failEl);
          this.lastFailDisplay = '';
          this.markFormForReset(this.lastSubmittedForm);
          this.callbacks.onError(undefined, message || undefined);
        } else {
          this.lastFailDisplay = current;
        }
      });

      this.failObserver.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
      });
    };

    // Setup observers if elements exist
    if (this.successEl) {
      setupSuccessObserver(this.successEl);
    }

    if (this.failEl) {
      setupFailObserver(this.failEl);
    }

    // Watch for dynamically added popup elements
    this.popupObserver?.disconnect();
    this.popupObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check for success popup
              if (!this.successEl) {
                const successPopup =
                  node.classList?.contains('success-popup') &&
                  node.classList?.contains('message-popup')
                    ? node
                    : node.querySelector<HTMLElement>('.message-popup.success-popup');

                if (successPopup) {
                  setupSuccessObserver(successPopup);
                }
              }

              // Check for fail popup
              if (!this.failEl) {
                const failPopup =
                  node.classList?.contains('fail-popup') &&
                  node.classList?.contains('message-popup')
                    ? node
                    : node.querySelector<HTMLElement>('.message-popup.fail-popup');

                if (failPopup) {
                  setupFailObserver(failPopup);
                }
              }
            }
          });
        }
      }
    });

    if (document.body) {
      this.popupObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Prevent form submission from polluting URL with query parameters
    this.setupFormSubmitPrevention();

    // Also observe for dynamically added forms
    this.observeForNewForms();

    // Polling fallback: Ensures popup detection even if MutationObserver misses changes
    // Use global flag to ensure only ONE polling interval runs across all instances
    const pollingKey = '__cwsFormPollingActive';
    if (!(window as any)[pollingKey]) {
      (window as any)[pollingKey] = true;

      this.pollingIntervalId = window.setInterval(() => {
        if (this.isDestroyed) return;

        try {
          // Check all success popups
          const successPopups = document.querySelectorAll<HTMLElement>(
            '.message-popup.success-popup',
          );
          successPopups.forEach((popup) => {
            const display = popup.style.display;
            if (display === 'block' && this.lastSuccessDisplay !== 'block') {
              const message = this.extractMessage(popup);
              hidePopup(popup);
              this.lastSuccessDisplay = '';
              this.markFormForReset(this.lastSubmittedForm);
              this.callbacks.onSuccess(undefined, message || undefined);
            }
          });

          // Check all fail popups
          const failPopups = document.querySelectorAll<HTMLElement>('.message-popup.fail-popup');
          failPopups.forEach((popup) => {
            const display = popup.style.display;
            if (display === 'block' && this.lastFailDisplay !== 'block') {
              const message = this.extractMessage(popup);
              hidePopup(popup);
              this.lastFailDisplay = '';
              this.markFormForReset(this.lastSubmittedForm);
              this.callbacks.onError(undefined, message || undefined);
            }
          });
        } catch (error) {
          // Silently handle errors to prevent polling from breaking
        }
      }, 150); // Check every 150ms (balanced performance)
    }
  }

  /**
   * Observes DOM for dynamically added forms and applies URL pollution prevention.
   */
  private observeForNewForms() {
    this.formObserver?.disconnect();
    this.formObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              const newForms = node.querySelectorAll<HTMLFormElement>(FORM_SELECTOR);
              if (newForms.length > 0) {
                this.setupFormSubmitPrevention();
              }
            }
          });
        }
      }
    });

    if (document.body) {
      this.formObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  /**
   * Configures forms to preserve Sitecore AJAX flow while preventing fallback native submit.
   */
  private setupFormSubmitPrevention() {
    const forms = document.querySelectorAll<HTMLFormElement>(FORM_SELECTOR);

    forms.forEach((form) => {
      const currentMethod = (form.getAttribute('method') || '').toLowerCase();
      if (!currentMethod || currentMethod === 'get') {
        form.method = 'post';
      }

      if (this.formSubmitHandlers.has(form)) {
        return;
      }

      const handler: EventListener = async (event) => {
        const formEl = event.currentTarget as HTMLFormElement;
        if (!formEl || this.isDestroyed) return;

        this.markSubmittedForm(formEl);

        const submitButton = this.getActiveSubmitButton(formEl);
        if (this.hasInlineOnClick(submitButton)) {
          const url = new URL(window.location.href);
          if (url.searchParams.toString()) {
            window.history.replaceState({}, document.title, url.pathname + url.hash);
          }
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        if (this.processingForms.has(formEl)) {
          return;
        }

        this.processingForms.add(formEl);

        try {
          const rebound = this.ensureSubmitBinding(formEl);
          if (rebound) {
            const reboundButton = this.getActiveSubmitButton(formEl);
            if (reboundButton) {
              queueMicrotask(() => reboundButton.click());
              return;
            }
          }

          const rescueResult = await this.submitRescueRequest(formEl);
          this.markFormForReset(formEl);

          if (rescueResult.ok) {
            this.callbacks.onSuccess(undefined, rescueResult.message);
          } else {
            this.callbacks.onError(undefined, rescueResult.message);
          }
        } catch {
          this.markFormForReset(formEl);
          this.callbacks.onError(undefined, undefined);
        } finally {
          this.processingForms.delete(formEl);

          const url = new URL(window.location.href);
          if (url.searchParams.toString()) {
            window.history.replaceState({}, document.title, url.pathname + url.hash);
          }
        }
      };

      this.formSubmitHandlers.set(form, handler);
      form.addEventListener('submit', handler, { capture: true });
    });
  }

  /**
   * Cleans up all observers and intervals to prevent memory leaks.
   * Should be called when the interceptor is no longer needed.
   */
  destroy() {
    if (this.isDestroyed) return;

    // Disconnect observers
    this.successObserver?.disconnect();
    this.failObserver?.disconnect();
    this.popupObserver?.disconnect();
    this.formObserver?.disconnect();
    this.successObserver = null;
    this.failObserver = null;
    this.popupObserver = null;
    this.formObserver = null;

    this.formSubmitHandlers.forEach((handler, form) => {
      form.removeEventListener('submit', handler, { capture: true } as EventListenerOptions);
    });
    this.formSubmitHandlers.clear();

    // Clear polling interval
    if (this.pollingIntervalId !== null) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
    }

    // Clear references
    this.successEl = null;
    this.failEl = null;
    this.pendingResetForms.clear();
    this.lastSubmittedForm = null;
    this.isDestroyed = true;
  }
}
