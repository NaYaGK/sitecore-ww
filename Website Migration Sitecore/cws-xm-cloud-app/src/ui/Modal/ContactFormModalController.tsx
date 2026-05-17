'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import {
  closeContactFormModal,
  getIsContactFormModalOpen,
  getCurrentFormId,
  subscribeToContactFormModal,
} from './contact_form_modal';

export const ContactFormModalController = (): ReactElement | null => {
  const [open, setOpen] = useState(false);
  const [currentFormId, setCurrentFormId] = useState<string | null>(null);

  useEffect(() => {
    setOpen(getIsContactFormModalOpen());
    setCurrentFormId(getCurrentFormId());

    return subscribeToContactFormModal(() => {
      setOpen(getIsContactFormModalOpen());
      setCurrentFormId(getCurrentFormId());
    });
  }, []);

  useEffect(() => {
    if (!open || !currentFormId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeContactFormModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, currentFormId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Check all forms on page
    const allForms = document.querySelectorAll('form');

    // Find form using data-prefill identifier (matches formHiddenFields.ts)
    const formElement = document.querySelector<HTMLFormElement>(
      'form:has(input[name="name"][data-prefill="contact_pop_up"])',
    );

    if (!formElement) {
      return;
    }

    const existingCloseBtn = formElement.querySelector('.cws-contact-form-modal-close');
    if (existingCloseBtn) {
      return;
    }

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'cws-contact-form-modal-close';
    closeButton.setAttribute('aria-label', 'Close contact form modal');
    closeButton.innerHTML = ''; // Let CSS background handle the icon
    closeButton.onclick = () => closeContactFormModal();

    // Add button to the form element to maintain absolute positioning relative to form
    formElement.appendChild(closeButton);

    return () => {
      if (closeButton.parentNode === formElement) {
        formElement.removeChild(closeButton);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Find the contact form element
      const formElement = document.querySelector<HTMLFormElement>(
        'form:has(input[name="name"][data-prefill="contact_pop_up"])',
      );

      if (!formElement) {
        return;
      }

      // Check if click is on the form itself or any of its descendants
      const isFormClick = formElement.contains(target);

      // Also check if click is on any element that's part of the form UI
      // (Sitecore may render some elements outside the form tag)
      const isFormRelated =
        target.closest('form') === formElement ||
        target.closest('.main-form-wrapper') !== null ||
        target.classList.contains('form-field-label') ||
        target.classList.contains('global-input-label') ||
        target.closest('.cws-form') !== null;

      // Close only if click is completely outside form and form-related elements
      if (!isFormClick && !isFormRelated) {
        closeContactFormModal();
      }
    };

    // Small delay to prevent immediate closing when modal opens
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [open]);

  if (!open) return null;

  return <div className="cws-contact-form-modal-overlay" role="presentation" aria-hidden="true" />;
};
