'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export interface FormSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'success' | 'error' | null;
  title?: string;
  message?: string;
}

const DEFAULT_SUCCESS_TITLE = 'Thank You!';
const DEFAULT_SUCCESS_MESSAGE =
  'Thank you for submitting your request with CWS Workwear. One of our representative will reach out to you shortly.';
const DEFAULT_ERROR_TITLE = 'Submission Failed';
const DEFAULT_ERROR_MESSAGE =
  'We could not submit your request. Please try again or contact us directly.';

export function FormSubmissionDialog({
  open,
  onOpenChange,
  status,
  title,
  message,
}: FormSubmissionDialogProps) {
  const isSuccess = status === 'success';

  const displayTitle = title || (isSuccess ? DEFAULT_SUCCESS_TITLE : DEFAULT_ERROR_TITLE);
  const displayMessage = message || (isSuccess ? DEFAULT_SUCCESS_MESSAGE : DEFAULT_ERROR_MESSAGE);

  const handleClose = () => {
    onOpenChange(false);
  };

  const contentClassName = `fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#fefefe] border border-[#888] shadow-[0_10px_38px_-10px_rgba(0,0,0,0.35),0_10px_20px_-15px_rgba(0,0,0,0.2)] w-4/5 max-w-[400px] max-h-[85vh] p-5 z-[10001] animate-[contentShow_150ms_cubic-bezier(0.16,1,0.3,1)] whitespace-normal focus:outline-none lg:w-[30%] ${
    isSuccess ? 'border-t-[10px] border-t-green-500' : 'border-t-[10px] border-t-red-500'
  }`;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[10000] animate-[overlayShow_150ms_cubic-bezier(0.16,1,0.3,1)] bg-black/75" />
        <DialogPrimitive.Content className={contentClassName}>
          <DialogPrimitive.Title className="m-0 mb-2 text-2xl font-semibold text-black">
            {displayTitle}
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="m-0 mb-4 max-w-[800px] text-base leading-[18px] text-[#444] md:mb-4 lg:leading-[18px]">
            {displayMessage}
          </DialogPrimitive.Description>

          <div className="flex justify-start gap-3">
            <button
              type="button"
              className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-none border-2 border-black bg-white px-8 py-2 text-base leading-[1.3] font-medium text-black transition-all duration-100 hover:bg-[#000] hover:text-[#fff] active:bg-[#ebebeb] md:mt-5 md:px-12 md:text-lg"
              onClick={handleClose}
            >
              OK
            </button>
          </div>

          <DialogPrimitive.Close asChild>
            <button
              type="button"
              className="absolute top-4 right-4 inline-flex h-[25px] w-[25px] cursor-pointer items-center justify-center rounded-full text-[#666666] transition-all duration-150 hover:bg-[#f0f0f0] hover:text-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(0,0,0,0.3)]"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export default FormSubmissionDialog;
