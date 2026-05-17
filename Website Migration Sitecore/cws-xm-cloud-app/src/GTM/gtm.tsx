'use client'; // Must be the very first line for Next.js client components

import { useEffect } from 'react';

// --- GTM Configuration ---
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
export const GTM_SERVER_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_SERVER_CONTAINER_ID;
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const GA_PROPERTY_NAME = process.env.NEXT_PUBLIC_GA_PROPERTY_NAME;
export const ACCOUNT_NAME = process.env.NEXT_PUBLIC_ACCOUNT_NAME;


// --- Extend window types safely ---
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// --- GTM Core Functions ---
export type GTMEvent = {
  event: string;
  pagePath?: string;
  [key: string]: any;
};

export const sendGTMEvent = (data: GTMEvent) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];

  const safeData: Record<string, any> = {};
  for (const key in data) {
    const value = data[key];
    safeData[key] = value === undefined || value === null ? '' : value;
  }

  // Add GTM configuration validation
  const eventData: GTMEvent & {
    gtm_container_id: string;
    gtm_server_container_id: string;
    ga_property_id: string;
    ga_property_name: string;
    account_name: string;
    event_timestamp: string;
  } = {
    event: safeData.event, // Ensure event property is explicitly set
    ...safeData,
    // Add GTM container info for validation
    gtm_container_id: GTM_ID || '',
    gtm_server_container_id: GTM_SERVER_CONTAINER_ID || '',
    ga_property_id: GA_ID || '',
    ga_property_name: GA_PROPERTY_NAME || '',
    account_name: ACCOUNT_NAME || '',
    // Add timestamp for debugging
    event_timestamp: new Date().toISOString(),
  };

  window.dataLayer.push(eventData);
};

export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventData,
  });
};

// --- Helper Functions ---
export const generateTransactionId = () => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1_000_000_000);
  return `${timestamp}-${randomId}`;
};

// --- GTM Provider Component ---
export function GTMProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!GTM_ID) return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    // Load GTM script
    (function (w: any, d: any, s: string, l: string, i: string) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s);
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      j.async = true;
      f.parentNode?.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
  }, []);

  return null;
}

// --- Generic Event Tracking Component ---
export function GenericEventTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dedicated event listener for header-contact button
    const handleHeaderContactClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const headerContactButton = target.closest('[data-tracking="header-contact"]') as HTMLElement | null;

      if (headerContactButton) {
        const trackingId = headerContactButton.getAttribute('data-tracking');
        const clickText = headerContactButton.innerText?.trim() || headerContactButton.textContent?.trim() || headerContactButton.getAttribute('aria-label') || '';
        const linkUrl = window.location.href;

        if (trackingId) {
          trackEvent('CTA_click', {
            element_text: clickText,
            tracking_id: trackingId,
            element_type: 'button',
            link_url: linkUrl
          });
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Handle anchor links
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a') as HTMLAnchorElement;
        
        if (link) {
          const href = link.href;
          const text = link.textContent?.trim() || link.innerText || '';
          const isOutbound = href && (href.startsWith('http') && !href.includes(window.location.hostname));
          
          // Fire click event
          trackEvent('click', {
            link_url: href,
            link_text: text,
            outbound: isOutbound,
            destination_url: href
          });
          
          // Fire outbound click event if applicable
          if (isOutbound) {
            trackEvent('outbound_click', {
              link_url: href,
              link_text: text,
              destination_url: href
            });
          }
          
          // Fire file download event if applicable
          if (href && /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv|jpg|jpeg|png|gif|mp4|mp3|avi|mov)$/i.test(href)) {
            trackEvent('file_download', {
              file_name: href.split('/').pop() || '',
              file_extension: href.split('.').pop() || '',
              link_url: href
            });
          }
        }
      }
      
      // Handle buttons
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target as HTMLButtonElement : target.closest('button') as HTMLButtonElement;
        
        if (button) {
          const text = button.textContent?.trim() || button.innerText || '';
          const trackingId = button.getAttribute('data-tracking');
          
          // Fire CTA_click event for buttons with data-tracking attribute
          if (trackingId) {
            trackEvent('CTA_click', {
              element_text: text,
              tracking_id: trackingId,
              element_type: 'button'
            });
          } else {
            // Fire generic click event for other buttons
            trackEvent('click', {
              element_text: text,
              element_type: 'button'
            });
          }
        }
      }
      
      // Handle elements with data-tracking attribute (for broader coverage)
      const trackedElement = target.closest('[data-tracking]');
      if (trackedElement && !trackedElement.matches('a, button')) {
        const trackingId = trackedElement.getAttribute('data-tracking');
        const text = trackedElement.textContent?.trim() || '';
        const tagName = trackedElement.tagName.toLowerCase();
        
        if (trackingId) {
          trackEvent('CTA_click', {
            element_text: text,
            tracking_id: trackingId,
            element_type: tagName
          });
        }
      }
    };

    // Add click event listeners to document
    document.addEventListener('click', handleClick, true);
    document.addEventListener('click', handleHeaderContactClick, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('click', handleHeaderContactClick, true);
    };
  }, []);

  return null;
}

// --- Scroll Tracking ---
export function ScrollTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let hasFired25Percent = false;
    let hasFired50Percent = false;
    let hasFired75Percent = false;
    let hasFired90Percent = false;
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      try {
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight;
        
        // Prevent division by zero
        if (scrollHeight <= clientHeight) return;
        
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        
        // Fire scroll events at different thresholds
        if (scrollPercentage >= 25 && !hasFired25Percent) {
          trackEvent('scroll', {
            scroll_threshold: 25,
            scroll_percentage: Math.round(scrollPercentage)
          });
          hasFired25Percent = true;
        }
        
        if (scrollPercentage >= 50 && !hasFired50Percent) {
          trackEvent('scroll', {
            scroll_threshold: 50,
            scroll_percentage: Math.round(scrollPercentage)
          });
          hasFired50Percent = true;
        }
        
        if (scrollPercentage >= 75 && !hasFired75Percent) {
          trackEvent('scroll', {
            scroll_threshold: 75,
            scroll_percentage: Math.round(scrollPercentage)
          });
          hasFired75Percent = true;
        }
        
        if (scrollPercentage >= 90 && !hasFired90Percent) {
          trackEvent('scroll', {
            scroll_threshold: 90,
            scroll_percentage: Math.round(scrollPercentage)
          });
          hasFired90Percent = true;
        }
      } catch (error) {
        console.warn('Scroll tracking error:', error);
      }
    };

    // Throttle scroll events for performance
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null as any;
      }, 200);
    };

    // Multiple event listeners for better compatibility
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    window.addEventListener('resize', throttledHandleScroll, { passive: true });
    
    // Initial check in case user is already scrolled
    setTimeout(handleScroll, 1000);
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      window.removeEventListener('resize', throttledHandleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return null;
}

// --- Enhanced Scroll Tracking for Stage Environment ---
export function EnhancedScrollTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollCheckInterval: NodeJS.Timeout;
    let hasFired90Percent = false;
    
    const checkScroll = () => {
      try {
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        const clientHeight = document.documentElement.clientHeight || window.innerHeight || 0;
        
        if (scrollHeight > clientHeight) {
          const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
          
          if (scrollPercentage >= 90 && !hasFired90Percent) {
            // Try multiple event names for compatibility
            trackEvent('scroll', {
              scroll_threshold: 90,
              scroll_percentage: Math.round(scrollPercentage),
              page_location: window.location.href,
              page_title: document.title
            });
            
            // Also try standard GA4 event
            if (window.dataLayer) {
              window.dataLayer.push({
                event: 'scroll',
                scroll_threshold: 90,
                scroll_percentage: Math.round(scrollPercentage)
              });
            }
            
            hasFired90Percent = true;
          }
        }
      } catch (error) {
        console.warn('Enhanced scroll tracking error:', error);
      }
    };

    // Use both scroll event and interval polling for reliability
    window.addEventListener('scroll', checkScroll, { passive: true });
    
    // Poll every 2 seconds as fallback for environments where scroll events might be blocked
    scrollCheckInterval = setInterval(checkScroll, 2000);
    
    // Initial check
    setTimeout(checkScroll, 1000);
    
    return () => {
      window.removeEventListener('scroll', checkScroll);
      if (scrollCheckInterval) clearInterval(scrollCheckInterval);
    };
  }, []);

  return null;
}

// --- Navigation Click Tracking ---
export interface NavigationClickData {
  link_url: string;
  click_text: string;
  click_element: string;
}

export const trackNavigationClick = (element: HTMLElement) => {
  const linkUrl = element.getAttribute('href') || window.location.href;
  const clickText = element.innerText?.trim() || element.getAttribute('aria-label') || '';
  
  // Determine click_element based on element attributes and location
  let clickElement = 'navigation';
  
  // Header elements
  if (element.closest('header')) {
    if (element.getAttribute('data-tracking') === 'header-contact') {
      clickElement = 'header_contact_button';
    } else if (element.classList.contains('logo') || element.closest('.logo')) {
      clickElement = 'header_logo';
    } else if (element.closest('.main-navigation, .nav, [aria-label="Main navigation"]')) {
      clickElement = 'navigation product category';
    } else if (element.closest('.top-navigation, .top-nav')) {
      clickElement = 'navigation top menu';
    } else {
      clickElement = 'navigation product category';
    }
  }
  
  // Footer elements
  else if (element.closest('footer')) {
    const footer = element.closest('footer');
    
    if (element.closest('.contact-section, .contact-info') || element.getAttribute('href')?.startsWith('tel:') || element.getAttribute('href')?.startsWith('mailto:')) {
      clickElement = 'footer_contact';
    } else if (element.closest('.social-links, .social-icons') || element.closest('[aria-label*="social"]')) {
      clickElement = 'footer_social';
    } else if (element.closest('.legal-links, .legal') || element.closest('[aria-label*="legal"]')) {
      clickElement = 'footer_legal';
    } else {
      clickElement = 'footer_navigation';
    }
  }
  
  // Use data-tracking attribute if available
  const dataTracking = element.getAttribute('data-tracking');
  if (dataTracking) {
    clickElement = dataTracking;
  }
  
  const navigationData: NavigationClickData = {
    link_url: linkUrl,
    click_text: clickText,
    click_element: clickElement
  };
  
  trackEvent('navigation_click', navigationData);
};

// --- Contact Click Tracking ---
export interface ContactClickData {
  contact_type: 'phone' | 'email';
  contact_text: string;
}

export const trackContactClick = (element: HTMLElement) => {
  const href = element.getAttribute('href');
  if (!href) return;

  let contactType: 'phone' | 'email';
  if (href.startsWith('tel:')) {
    contactType = 'phone';
  } else if (href.startsWith('mailto:')) {
    contactType = 'email';
  } else {
    return; // Not a phone or email link
  }

  const contactText = element.innerText?.trim() || element.getAttribute('aria-label') || '';

  const contactData: ContactClickData = {
    contact_type: contactType,
    contact_text: contactText,
  };

  trackEvent('contact_click', contactData);
};

export function ContactTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href^="tel:"], a[href^="mailto:"]');

      if (link) {
        trackContactClick(link as HTMLElement);
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}

// --- Navigation Tracking Component ---
export function NavigationTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Find the closest clickable element
      const clickableElement = target.closest('a, button, [role="button"]');
      
      if (!clickableElement) return;
      
      // Check if element is in header or footer
      const isInHeader = clickableElement.closest('header');
      const isInFooter = clickableElement.closest('footer');
      
      if (isInHeader || isInFooter) {
        // Track immediately before navigation
        trackNavigationClick(clickableElement as HTMLElement);
      }
    };

    // Add click event listener to document
    document.addEventListener('click', handleClick, true);
    
    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}
