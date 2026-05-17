import { useState, useCallback } from 'react';

export interface FormSubmissionState {
  open: boolean;
  status: 'success' | 'error' | null;
  title?: string;
  message?: string;
}

export const useFormSubmissionDialog = () => {
  const [state, setState] = useState<FormSubmissionState>({
    open: false,
    status: null,
    title: undefined,
    message: undefined,
  });

  const showSuccess = useCallback((title?: string, message?: string) => {
    setState({
      open: true,
      status: 'success',
      title,
      message,
    });
  }, []);

  const showError = useCallback((title?: string, message?: string) => {
    setState({
      open: true,
      status: 'error',
      title,
      message,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setState({
      open: false,
      status: null,
      title: undefined,
      message: undefined,
    });
  }, []);

  return {
    ...state,
    showSuccess,
    showError,
    closeDialog,
  };
};
