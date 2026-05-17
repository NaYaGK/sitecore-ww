import { useEffect } from 'react';
import { initGlobalFormHiddenFieldFiller } from '@/utils/formHiddenFields';

export const FormValidation = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize hidden field filler - fills forms proactively when detected in DOM
    initGlobalFormHiddenFieldFiller();

    const removeClientErrorForField = (wrapper: Element) => {
      try {
        wrapper.classList.remove('has-error');
        const errorContainer = wrapper.querySelector('.cws-error-container');
        if (errorContainer) {
          errorContainer.textContent = '';
        }
      } catch (error) {
        console.error('FormValidation: Failed removing client error', error);
      }
    };

    const hasServerError = (wrapper: Element): boolean => {
      // Check in wrapper
      let serverError = wrapper.querySelector(
        '.global-input-error-message.form-input-error-message',
      );
      if (serverError) return true;

      // Check in parent container
      const parent = wrapper.parentElement;
      if (parent) {
        serverError = parent.querySelector('.global-input-error-message.form-input-error-message');
        if (serverError) return true;
      }

      // Check in grandparent
      const grandparent = parent?.parentElement;
      if (grandparent) {
        serverError = grandparent.querySelector(
          '.global-input-error-message.form-input-error-message',
        );
        if (serverError) return true;
      }

      return false;
    };

    const removeServerErrorForField = (wrapper: Element) => {
      try {
        // Remove from wrapper
        wrapper
          .querySelectorAll('.global-input-error-message.form-input-error-message')
          .forEach((el) => {
            (el as HTMLElement).style.display = 'none';
            (el as HTMLElement).style.visibility = 'hidden';
          });

        // Remove from parent container
        const parent = wrapper.parentElement;
        if (parent) {
          parent
            .querySelectorAll('.global-input-error-message.form-input-error-message')
            .forEach((el) => {
              (el as HTMLElement).style.display = 'none';
              (el as HTMLElement).style.visibility = 'hidden';
            });
        }

        // Remove from grandparent
        const grandparent = parent?.parentElement;
        if (grandparent) {
          grandparent
            .querySelectorAll('.global-input-error-message.form-input-error-message')
            .forEach((el) => {
              (el as HTMLElement).style.display = 'none';
              (el as HTMLElement).style.visibility = 'hidden';
            });
        }
      } catch (error) {
        console.error('FormValidation: Failed removing server error for field', error);
      }
    };

    const clearClientErrorsWhereServerErrorsExist = () => {
      // Find all server errors and clear client errors in those fields
      // This ensures: SERVER error exists → clear CLIENT error
      const serverErrors = document.querySelectorAll(
        '.global-input-error-message.form-input-error-message',
      );
      serverErrors.forEach((serverError) => {
        // Find the wrapper for this server error
        let wrapper = serverError.closest('.form-input-wrapper-element');

        // If not found directly, check parent/grandparent for wrapper
        if (!wrapper) {
          const parent = serverError.parentElement;
          if (parent) {
            wrapper = parent.querySelector('.form-input-wrapper-element');
          }
        }
        if (!wrapper) {
          const grandparent = serverError.parentElement?.parentElement;
          if (grandparent) {
            wrapper = grandparent.querySelector('.form-input-wrapper-element');
          }
        }

        if (wrapper) {
          removeClientErrorForField(wrapper);
        }
      });
    };

    const cleanUrlParams = () => {
      const url = new URL(window.location.href);
      const params = url.searchParams;

      if (params.toString()) {
        window.history.replaceState({}, document.title, url.pathname + url.hash);
      }
    };

    const injectAttributes = (
      field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    ) => {
      if (field.dataset.validationInjected) return;
      // Validation attributes (pattern, maxlength, required) should be set in Sitecore CMS
      // No hardcoded regex or validation logic - rely on CMS configuration
      field.dataset.validationInjected = 'true';
    };

    const FORM_SELECTOR = 'form[data-formid]';
    const FIELD_SELECTOR =
      'form[data-formid] input, form[data-formid] textarea, form[data-formid] select';

    const injectFormClass = (form: Element) => {
      if (!form.classList.contains('cws-form')) {
        form.classList.add('cws-form');
      }
    };

    const markWrappersWithLabels = () => {
      const wrappers = document.querySelectorAll('.form-input-wrapper-element');
      wrappers.forEach((wrapper) => {
        // Check multiple locations for the label:
        // 1. Inside the wrapper (child)
        let hasLabel = wrapper.querySelector('.global-input-label.form-field-label');

        // 2. As a sibling (previous sibling)
        if (!hasLabel && wrapper.previousElementSibling) {
          if (
            wrapper.previousElementSibling.classList.contains('global-input-label') &&
            wrapper.previousElementSibling.classList.contains('form-field-label')
          ) {
            hasLabel = wrapper.previousElementSibling;
          }
        }

        // 3. In the parent container (sibling at parent level)
        if (!hasLabel && wrapper.parentElement) {
          hasLabel = wrapper.parentElement.querySelector('.global-input-label.form-field-label');
        }

        // 4. In grandparent (for nested structures)
        if (!hasLabel && wrapper.parentElement?.parentElement) {
          hasLabel = wrapper.parentElement.parentElement.querySelector(
            '.global-input-label.form-field-label',
          );
        }

        if (hasLabel) {
          wrapper.classList.add('has-label');
        } else {
          wrapper.classList.remove('has-label');
        }
      });
    };

    const populateEmptyLabels = (root: ParentNode = document) => {
      const labelSpans = root.querySelectorAll(
        'span.global-input-label.form-field-label',
      ) as NodeListOf<HTMLSpanElement>;

      labelSpans.forEach((labelSpan) => {
        if (labelSpan.dataset.labelPopulated === 'true') return;

        const labelClone = labelSpan.cloneNode(true) as HTMLSpanElement;
        labelClone
          .querySelectorAll(
            '.a11y-visible, .global-field-required.form-field-required, .form-field-required',
          )
          .forEach((el) => el.remove());

        const visibleText = (labelClone.textContent || '').replace(/\s+/g, ' ').trim();
        if (visibleText) return;

        const wrapper = labelSpan.closest('.form-input-wrapper-element');
        if (!wrapper) return;

        const input = wrapper.querySelector('input, textarea, select') as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement
          | null;
        if (!input) return;

        const placeholder = input.getAttribute('placeholder') || '';
        const dataLabel = input.getAttribute('data-label') || '';
        const ariaLabel = input.getAttribute('aria-label') || '';
        const name = (input.getAttribute('name') || '').replace(/_/g, ' ');

        const rawLabel = placeholder || dataLabel || ariaLabel || name;
        const cleanedLabel = rawLabel.replace(/\s*\*\s*$/, '').trim();
        if (!cleanedLabel) return;

        const requiredEl = labelSpan.querySelector('.global-field-required.form-field-required');

        if (requiredEl) {
          labelSpan.insertBefore(document.createTextNode(`${cleanedLabel} `), requiredEl);
        } else {
          labelSpan.textContent = cleanedLabel;
        }

        labelSpan.dataset.labelPopulated = 'true';
      });
    };

    const getFieldLabel = (
      target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    ): string => {
      const dataLabel = target.getAttribute('data-label') || '';
      const placeholder = target.getAttribute('placeholder') || '';
      const ariaLabel = target.getAttribute('aria-label') || '';
      const name = (target.getAttribute('name') || '').replace(/_/g, ' ');

      const rawLabel = dataLabel || placeholder || ariaLabel || name;
      const cleanLabel = rawLabel.replace(/\s*[\*:]\s*$/g, '').trim();

      return cleanLabel.length > 20 ? 'This field' : cleanLabel;
    };

    const isValidRegex = (pattern: string): boolean => {
      try {
        new RegExp(pattern);
        return true;
      } catch {
        return false;
      }
    };

    const escapeAttrValue = (value: string): string => {
      try {
        if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
          return CSS.escape(value);
        }
      } catch {
        return value;
      }
      return value.replace(/[^a-zA-Z0-9_\-]/g, '\\$&');
    };

    const validateField = (target: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
      const baseWrapper = target.closest('.form-input-wrapper-element');
      if (!baseWrapper) return;

      const inputType =
        target instanceof HTMLInputElement ? (target.getAttribute('type') || '').toLowerCase() : '';
      const isCheckbox = inputType === 'checkbox';
      const isRadio = inputType === 'radio';

      let wrapper: Element = baseWrapper;
      if (isRadio) {
        const radioGroup = target.closest('.radio-group-field');
        const groupWrapper = radioGroup?.querySelector('.form-input-wrapper-element');
        if (groupWrapper) {
          wrapper = groupWrapper;
        }
      }

      const pattern = target.getAttribute('pattern');
      const hasValidPattern = pattern && isValidRegex(pattern);
      const isRequired = target.hasAttribute('required');
      const value = target.value;
      let label = getFieldLabel(target);

      if (isRadio) {
        const groupLabelEl = target
          .closest('.radio-group-field')
          ?.querySelector('.global-input-label.form-field-label.form-group-label');
        const groupLabelText = (groupLabelEl?.textContent || '').replace(/\s+/g, ' ').trim();
        if (groupLabelText) {
          label = groupLabelText;
        }
      }

      const form = target.closest('form');
      const isCommonForm = form && form.classList.contains('cws-form');

      if (isCheckbox) {
        const checkboxTarget = target as HTMLInputElement;

        if (!isRequired && !checkboxTarget.checked) {
          wrapper.classList.remove('has-error');
          if (isCommonForm) {
            const errorContainer = wrapper.querySelector('.cws-error-container');
            if (errorContainer) {
              errorContainer.textContent = '';
            }
          }
          return;
        }
      }

      if (isRadio) {
        const radioTarget = target as HTMLInputElement;
        const name = radioTarget.getAttribute('name') || '';
        const formEl = radioTarget.closest('form');
        const radioSelector = name
          ? `input[type="radio"][name="${escapeAttrValue(name)}"]`
          : 'input[type="radio"]';
        const group = formEl
          ? Array.from(formEl.querySelectorAll<HTMLInputElement>(radioSelector))
          : [];
        const anyChecked = group.length ? group.some((el) => el.checked) : radioTarget.checked;

        if (!isRequired && !anyChecked) {
          wrapper.classList.remove('has-error');
          if (isCommonForm) {
            const errorContainer = wrapper.querySelector('.cws-error-container');
            if (errorContainer) {
              errorContainer.textContent = '';
            }
          }
          return;
        }
      }

      if (!isRequired && !value.trim()) {
        wrapper.classList.remove('has-error');
        if (isCommonForm) {
          const errorContainer = wrapper.querySelector('.cws-error-container');
          if (errorContainer) {
            errorContainer.textContent = '';
          }
        }
        return;
      }

      let isValid = true;
      let errorMessage = '';

      if (isCheckbox) {
        const checkboxTarget = target as HTMLInputElement;
        if (isRequired && !checkboxTarget.checked) {
          isValid = false;
          errorMessage = `${label || 'This field'} is required.`;
        }
      } else if (isRadio) {
        const radioTarget = target as HTMLInputElement;
        const name = radioTarget.getAttribute('name') || '';
        const formEl = radioTarget.closest('form');
        const radioSelector = name
          ? `input[type="radio"][name="${escapeAttrValue(name)}"]`
          : 'input[type="radio"]';
        const group = formEl
          ? Array.from(formEl.querySelectorAll<HTMLInputElement>(radioSelector))
          : [];
        const anyChecked = group.length ? group.some((el) => el.checked) : radioTarget.checked;
        if (isRequired && !anyChecked) {
          isValid = false;
          errorMessage = `${label || 'This field'} is required.`;
        }
      } else if (isRequired && !value.trim()) {
        isValid = false;
        errorMessage = `${label || 'This field'} is required.`;
      } else if (hasValidPattern && value.trim()) {
        const regex = new RegExp(pattern);
        if (!regex.test(value)) {
          isValid = false;
          errorMessage = `${label || 'This field'} does not meet the requirements.`;
        }
      }

      if (!isValid) {
        // Showing CLIENT error → remove SERVER error for this field
        removeServerErrorForField(wrapper);

        wrapper.classList.add('has-error');

        if (isCommonForm) {
          let errorContainer = wrapper.querySelector('.cws-error-container') as HTMLElement;

          if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'cws-error-container';
            wrapper.appendChild(errorContainer);
          }

          errorContainer.textContent = errorMessage;
        }
      } else {
        // Field is valid - clear client error but preserve server error if it exists
        wrapper.classList.remove('has-error');
        if (isCommonForm) {
          const errorContainer = wrapper.querySelector('.cws-error-container');
          if (errorContainer) {
            errorContainer.textContent = '';
          }
        }
        // Note: Server error is NOT removed here - it remains visible if present
      }
    };

    const handleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target) return;

      const isField =
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT') &&
        target.closest(FORM_SELECTOR);
      if (!isField) return;

      // validateField will handle removing server error if client error is shown
      validateField(target);
    };

    const handleInvalid = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target) return;

      const isField =
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT') &&
        target.closest(FORM_SELECTOR);
      if (!isField) return;

      event.preventDefault();
      validateField(target);
    };

    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target) return;

      const isField =
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT') &&
        target.closest(FORM_SELECTOR);
      if (!isField) return;

      // On focus, we don't remove any errors yet
      // Server errors remain visible until user triggers client validation
      // Client errors remain visible until field becomes valid
    };

    const handleInput = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement;
      if (!target) return;

      const isField =
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target.closest(FORM_SELECTOR);
      if (!isField) return;

      const wrapper = target.closest('.form-input-wrapper-element');
      if (!wrapper) return;

      validateField(target);
    };

    const handleChange = (event: Event) => {
      const target = event.target as HTMLSelectElement | HTMLInputElement;
      if (!target) return;

      const isSelectableInput =
        target.tagName === 'INPUT' &&
        (((target as HTMLInputElement).getAttribute('type') || '').toLowerCase() === 'checkbox' ||
          ((target as HTMLInputElement).getAttribute('type') || '').toLowerCase() === 'radio');

      const isField =
        (target.tagName === 'SELECT' || isSelectableInput) && target.closest(FORM_SELECTOR);
      if (!isField) return;

      const wrapper = target.closest('.form-input-wrapper-element');
      if (!wrapper) return;

      validateField(target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement);
    };

    const validateAllFields = (form: HTMLFormElement): boolean => {
      let allValid = true;

      const processedRadioNames = new Set<string>();

      const fields = form.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >('input:not([type="submit"]):not([type="button"]):not([type="hidden"]), textarea, select');

      fields.forEach((field) => {
        if (field.offsetParent === null || field.disabled) return;

        const wrapper = field.closest('.form-input-wrapper-element');
        if (!wrapper) return;

        const pattern = field.getAttribute('pattern');
        const hasValidPattern = pattern && isValidRegex(pattern);
        const isRequired = field.hasAttribute('required');
        const value = field.value;

        const inputType =
          field instanceof HTMLInputElement ? (field.getAttribute('type') || '').toLowerCase() : '';
        const isCheckbox = field instanceof HTMLInputElement && inputType === 'checkbox';
        const isRadio = field instanceof HTMLInputElement && inputType === 'radio';

        if (isCheckbox) {
          const checkboxField = field as HTMLInputElement;
          if (!isRequired && !checkboxField.checked) {
            return;
          }

          if (isRequired && !checkboxField.checked) {
            validateField(checkboxField);
            allValid = false;
          }

          return;
        }

        if (isRadio) {
          const radioField = field as HTMLInputElement;
          const name = radioField.getAttribute('name') || '';

          if (name && processedRadioNames.has(name)) {
            return;
          }
          if (name) {
            processedRadioNames.add(name);
          }

          const radioSelector = name
            ? `input[type="radio"][name="${escapeAttrValue(name)}"]`
            : 'input[type="radio"]';
          const group = Array.from(form.querySelectorAll<HTMLInputElement>(radioSelector));
          const anyChecked = group.length ? group.some((el) => el.checked) : radioField.checked;

          if (!isRequired && !anyChecked) {
            return;
          }

          if (isRequired && !anyChecked) {
            validateField(radioField);
            allValid = false;
          }

          return;
        }

        if (!isRequired && !value.trim()) {
          return;
        }

        let isFieldValid = true;
        if (isRequired && !value.trim()) {
          isFieldValid = false;
        } else if (hasValidPattern && value.trim()) {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            isFieldValid = false;
          }
        }

        if (!isFieldValid) {
          validateField(field);
          allValid = false;
        }
      });

      return allValid;
    };

    const handleSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form || !form.hasAttribute('data-formid')) return;

      // Hidden fields are filled proactively by initGlobalFormHiddenFieldFiller
      // when forms are detected in DOM and on submit button click

      // Run client-side validation before submission
      const isValid = validateAllFields(form);

      // Block submission if client-side validation fails
      if (!isValid) {
        event.preventDefault();
        event.stopPropagation();

        const firstError = form.querySelector('.form-input-wrapper-element.has-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const errorInput = firstError.querySelector<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >('input, textarea, select');
          if (errorInput && 'focus' in errorInput) {
            setTimeout(() => (errorInput as HTMLElement).focus(), 300);
          }
        }

        return false;
      }

      // Clear all client-side errors before submission (server will return new errors if needed)
      form.querySelectorAll('.form-input-wrapper-element.has-error').forEach((wrapper) => {
        wrapper.classList.remove('has-error');
        const errorContainer = wrapper.querySelector('.cws-error-container');
        if (errorContainer) {
          errorContainer.textContent = '';
        }
      });

      return;
    };

    const disableNumberInputScroll = (e: WheelEvent) => {
      const target = e.target as HTMLInputElement;
      if (target.type === 'number') {
        target.blur();
        e.preventDefault();
      }
    };

    try {
      cleanUrlParams();
      // When page loads with server errors, clear any client errors in those fields
      clearClientErrorsWhereServerErrorsExist();

      // Also run after a delay to catch server errors rendered after initial JS execution
      setTimeout(() => {
        clearClientErrorsWhereServerErrorsExist();
      }, 100);
      setTimeout(() => {
        clearClientErrorsWhereServerErrorsExist();
      }, 500);

      const form = document.querySelector(FORM_SELECTOR);
      if (form) {
        injectFormClass(form);
      }

      const fields = document.querySelectorAll(FIELD_SELECTOR);
      fields.forEach((field) =>
        injectAttributes(field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement),
      );

      populateEmptyLabels();
      markWrappersWithLabels();

      const numberInputs = document.querySelectorAll('input[type="number"]');
      numberInputs.forEach((input) => {
        input.addEventListener('wheel', disableNumberInputScroll as EventListener, {
          passive: false,
        });
      });

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // Check if a server error was added - if so, clear client errors for that field
              // This handles: SERVER error added → clear CLIENT error
              const isServerError =
                node.classList.contains('global-input-error-message') &&
                node.classList.contains('form-input-error-message');
              const hasServerError = node.querySelector(
                '.global-input-error-message.form-input-error-message',
              );

              if (isServerError || hasServerError) {
                // Server error was added, clear client errors
                clearClientErrorsWhereServerErrorsExist();
              }

              const foundForm = node.closest(FORM_SELECTOR) || node.querySelector(FORM_SELECTOR);

              if (foundForm || node.matches(FORM_SELECTOR)) {
                const targetForm = foundForm || node;
                injectFormClass(targetForm);

                if (node.matches('input, textarea, select')) {
                  injectAttributes(
                    node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
                  );
                }

                const nestedFields = node.querySelectorAll('input, textarea, select');
                nestedFields.forEach((el) => {
                  if (el.closest(FORM_SELECTOR)) {
                    injectAttributes(
                      el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
                    );
                  }
                });

                markWrappersWithLabels();

                const dynamicNumberInputs = node.querySelectorAll('input[type="number"]');
                dynamicNumberInputs.forEach((input) => {
                  input.addEventListener('wheel', disableNumberInputScroll as EventListener, {
                    passive: false,
                  });
                });

                populateEmptyLabels(node);
              }
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });

      document.addEventListener('focusout', handleBlur);
      document.addEventListener('focusin', handleFocus);
      document.addEventListener('input', handleInput);
      document.addEventListener('change', handleChange);
      document.addEventListener('submit', handleSubmit, true);
      document.addEventListener('invalid', handleInvalid, true);

      return () => {
        observer.disconnect();
        document.removeEventListener('focusout', handleBlur);
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('input', handleInput);
        document.removeEventListener('change', handleChange);
        document.removeEventListener('submit', handleSubmit, true);
        document.removeEventListener('invalid', handleInvalid, true);

        numberInputs.forEach((input) => {
          input.removeEventListener('wheel', disableNumberInputScroll as EventListener);
        });
      };
    } catch (error) {
      console.error('FormValidation: Initialization failed', error);
      return;
    }
  }, []);

  return null;
};
