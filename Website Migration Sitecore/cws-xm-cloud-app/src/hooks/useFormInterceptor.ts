import { useCallback, useEffect, useRef } from 'react';
import { SitecoreFormInterceptor } from '@/utils/sitecoreFormInterceptor';
import { useFormSubmissionDialog } from './useFormSubmissionDialog';
import { closeContactFormModal } from '@/ui/Modal/contact_form_modal';

const FORM_SELECTOR = 'form[data-formid]';

/**
 * Wait for DOM to be ready and Sitecore forms to be loaded
 */
function waitForFormsReady(): Promise<void> {
  return new Promise((resolve) => {
    // If document is already loaded, check for forms immediately
    if (document.readyState === 'complete') {
      const forms = document.querySelectorAll(FORM_SELECTOR);
      if (forms.length > 0) {
        resolve();
        return;
      }
    }

    // Use MutationObserver to detect when forms are added to DOM
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          const forms = document.querySelectorAll(FORM_SELECTOR);
          if (forms.length > 0) {
            observer.disconnect();
            resolve();
            return;
          }
        }
      }
    });

    // Start observing
    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Fallback: resolve after 2 seconds even if no forms detected
    // This handles pages without forms gracefully
    setTimeout(() => {
      observer.disconnect();
      resolve();
    }, 2000);

    // Also listen for DOMContentLoaded if not yet fired
    if (document.readyState !== 'complete') {
      window.addEventListener(
        'load',
        () => {
          const forms = document.querySelectorAll(FORM_SELECTOR);
          if (forms.length > 0) {
            observer.disconnect();
            resolve();
          }
        },
        { once: true },
      );
    }
  });
}

/**
 * Custom hook to initialize and manage the Sitecore form interceptor
 * Handles form submission success/error detection and displays custom popup dialogs
 */
export function useFormInterceptor() {
  const interceptorRef = useRef<SitecoreFormInterceptor | null>(null);
  const { open, status, title, message, showSuccess, showError, closeDialog } =
    useFormSubmissionDialog();

  const closeDialogAndReset = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        interceptorRef.current?.acknowledgeDialogAndResetForms();
        closeDialog();
      }
    },
    [closeDialog],
  );

  useEffect(() => {
    let mounted = true;

    // Create callbacks inside useEffect to avoid dependency issues
    const callbacks = {
      onSuccess: (customTitle?: string, customMessage?: string) => {
        // Close contact form modal before showing success dialog
        closeContactFormModal();
        showSuccess(customTitle, customMessage);
      },
      onError: (customTitle?: string, customMessage?: string) => {
        // Close contact form modal before showing error dialog
        closeContactFormModal();
        showError(customTitle, customMessage);
      },
    };

    // Wait for forms to be ready before initializing interceptor
    waitForFormsReady().then(() => {
      if (!mounted) {
        return;
      }

      interceptorRef.current = new SitecoreFormInterceptor(callbacks);
      interceptorRef.current.init();
    });

    return () => {
      mounted = false;
      if (interceptorRef.current) {
        interceptorRef.current.destroy();
        interceptorRef.current = null;
      }
    };
    // Only re-run when the actual callback functions change
  }, [showSuccess, showError]);

  return {
    open,
    status,
    title,
    message,
    closeDialog: closeDialogAndReset,
  };
}
