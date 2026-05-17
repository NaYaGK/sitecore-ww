// @ts-nocheck
'use client';

import { useEffect, useRef, useState } from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { StickyContactBarProps } from './StickyContactBar.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const StickyContactBarVariants = {
  Default: 'Default',
  PriorityVisible: 'priority visible',
} as const;

type StickyContactBarVariant =
  (typeof StickyContactBarVariants)[keyof typeof StickyContactBarVariants];

/** Extract phone from Sitecore field (supports both value and jsonValue.value) */
const getPhoneValue = (fields: StickyContactBarProps['fields']): string | undefined => {
  const raw =
    fields?.PhoneNumber?.value ??
    (fields?.PhoneNumber as { jsonValue?: { value?: string } })?.jsonValue?.value;
  if (raw == null) return undefined;
  const s = String(raw).trim();
  return s || undefined;
};

/** Normalize phone: remove non-numeric except +. Use same format for display and href to avoid hydration mismatch. */
const normalizePhone = (phone?: string): { display: string; href: string } => {
  if (!phone) return { display: '', href: '#' };
  const cleaned = String(phone).replace(/[^0-9+]/g, '').trim();
  if (!cleaned) return { display: '', href: '#' };
  return {
    display: cleaned,
    href: `tel:${cleaned}`,
  };
};

const StickyContactBarLayout: React.FC<StickyContactBarProps & { variant: StickyContactBarVariant }> = ({ fields, rendering, variant }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const isDefault = variant === StickyContactBarVariants.Default;
  const isPriorityVisible = variant === StickyContactBarVariants.PriorityVisible;


  // Show on scroll
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isExpanded && barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const phoneValue = getPhoneValue(fields);
  const { display: phoneNumber, href: telLink } = normalizePhone(phoneValue);

  return (
    <div
      ref={barRef}
      className={cn(
        'fixed top-[427px] right-0 -translate-y-1/2 transition-all duration-400 md:top-[441px]',

        // Set z-index higher than hero-form (z-index: 50) when priority visible variant
        isPriorityVisible ? 'z-60' : 'z-20',

        isVisible
          ? 'pointer-events-auto scale-100 opacity-100'
          : 'pointer-events-none scale-80 opacity-0',
      )}
      data-component="StickyContactBar"
      role="complementary"
      aria-label="Contact information"
    >
      {/* Main button - circular when collapsed, expands to show phone number */}
      <div className="phone">
      <a
        href={telLink}
        title="Call us now!"
        suppressHydrationWarning
        className={cn(
          'flex cursor-pointer items-center justify-center gap-0 overflow-hidden rounded-l-2xl rounded-r-none border-none whitespace-nowrap no-underline transition-all duration-200 ease-in-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-current active:scale-98',
          'bg-[#eb0045] text-white hover:bg-[#d10039]', // Default red theme
          isExpanded
            ? 'h-11 w-auto justify-start px-2 md:h-20 md:px-[10px]'
            : 'h-12 w-[30px] p-0 md:h-[82px] md:w-[72px]',
        )}
        onClick={(e) => {
          if (!isExpanded) {
            e.preventDefault();
            setIsExpanded(true);
          }
          // When expanded, allow the link to work normally
        }}
        aria-label={isExpanded ? `Call ${phoneNumber}` : ''}
      >
        <img
          src="/assets/icons/cws_phone.svg"
          alt="Call"
          className="mr-1 h-5 w-5 shrink-0 md:mr-3 md:h-10 md:w-10"
          aria-hidden="true"
        />
        <span
          className={cn(
            'text-base leading-none font-bold transition-all duration-300',
            'md:text-xl',
            isExpanded ? 'w-auto opacity-100 delay-100' : 'w-0 opacity-0',
          )}
          suppressHydrationWarning
        >
          {phoneNumber}
        </span>
      </a>
      </div>
    </div>
  );
};

export const Default: React.FC<StickyContactBarProps> = (props) => (
  <StickyContactBarLayout {...props} variant="Default" />
);

export const PriorityVisible: React.FC<StickyContactBarProps> = (props) => (
  <StickyContactBarLayout {...props} variant="priority visible" />
);

export default Default;
