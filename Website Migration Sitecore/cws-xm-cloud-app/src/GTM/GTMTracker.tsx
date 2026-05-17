'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import {
    generateTransactionId,
    triggerFormSubmit,
    triggerGenerateLead,
    triggerFormSubmitClick,
    triggerFormTouched,
    triggerFormVisibility,
    triggerFormSearch,
    triggerPhoneVisibility,
    triggerContactClick,
    triggerFormValidationError,
    triggerClickLpCta,
    triggerNavigationClick,
    triggerSelectContent,
    triggerPageView,
    triggerCTAClick,
} from '././GTMEvents';
import { GenericEventTracker, ScrollTracker, NavigationTracker, ContactTracker, EnhancedScrollTracker } from './gtm';

export const GTMTracker = () => {
    // Store transaction IDs to ensure consistency between events if needed
    const transactionIds = useRef<Record<string, string>>({});
    const lastSubmitted = useRef<Record<string, number>>({});
    const router = useRouter();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // --- Page View Tracking ---
        const handleRouteChange = (url: string) => {
            triggerPageView({
                page_location: window.location.origin + url,
                page_title: document.title,
                ...getGlobalParams()
            });
        };

        router.events.on('routeChangeComplete', handleRouteChange);

        // --- Helpers ---
        const getFormName = (form: HTMLFormElement) => {
            // Logic based on user flowchart
            const editFormName = form.getAttribute('data-edit-form-name');
            const editFormType = form.getAttribute('data-edit-form-type');

            if (editFormName === 'Contact') {
                // Check if user selects new client (default to true/new if unknown)
                // We need to check the form data for 'form_existing_client'
                const formData = new FormData(form);
                const existingClient = formData.get('form_existing_client');
                const isExisting = existingClient === '1' || existingClient === 'on' || existingClient === 'true';

                return isExisting ? 'form_service' : 'form_lead';
            }

            if (editFormType) {
                if (editFormType === 'Lead') return 'form_lead';
                if (editFormType === 'Generic') return 'form_generic';
                if (editFormType === 'Service') return 'form_service';
                return `form_${editFormType.toLowerCase()}`;
            }

            // Fallback to existing logic
            return (
                form.getAttribute('data-formid') ||
                form.getAttribute('name') ||
                form.getAttribute('id') ||
                'unknown_form'
            );
        };

        const getFormType = (form: HTMLFormElement) => {
            const hiddenInput = form.querySelector('input[name="form_type"]') as HTMLInputElement;
            const val = hiddenInput?.value || form.getAttribute('data-form-type');
            return val || 'lead';
        };

        const getGlobalParams = () => {
            const breadcrumbNav = document.querySelector('nav[aria-label="Breadcrumb"]');
            const breadcrumb = breadcrumbNav ? (breadcrumbNav as HTMLElement).innerText.replace(/\n/g, '|') : undefined;

            // Solution area - try to get from URL first segment
            const pathSegments = window.location.pathname.split('/').filter(Boolean);
            const solutionArea = pathSegments.length > 0 ? pathSegments[0] : undefined;

            return {
                breadcrumb,
                solution_area: solutionArea,
                event_tag_timestamp: Date.now(),
                // Add other globals if available
            };
        };

        const getFormTransactionId = (formName: string) => {
            if (!transactionIds.current[formName]) {
                transactionIds.current[formName] = generateTransactionId();
            }
            return transactionIds.current[formName];
        };

        const processFormSubmit = (form: HTMLFormElement) => {
            const globalParams = getGlobalParams();
            const formName = getFormName(form);

            // Deduplicate submissions (e.g. click + submit event firing together)
            const now = Date.now();
            if (lastSubmitted.current[formName] && now - lastSubmitted.current[formName] < 1000) {
                return;
            }
            lastSubmitted.current[formName] = now;

            const transactionId = getFormTransactionId(formName);
            const formData = new FormData(form);

            // Check for search form
            if (form.getAttribute('role') === 'search' || form.classList.contains('search-form') || formName.toLowerCase().includes('search')) {
                const searchTerm = (
                    formData.get('search_api_fulltext') ||
                    formData.get('q') ||
                    formData.get('search') ||
                    formData.get('keyword')
                ) as string;
                if (searchTerm) {
                    triggerFormSearch({
                        search_term: searchTerm,
                        ...globalParams
                    });
                }
            }

            // Extract specific fields for GTM
            // Extract specific fields for GTM
            const formLeadSource = (formData.get('form_lead_source') as string) || window.location.href;

            // Handle checkbox/toggle for existing client
            let formExistingClient = '0';
            const existingClientValue = formData.get('form_existing_client');
            if (existingClientValue === '1' || existingClientValue === 'on' || existingClientValue === 'true') {
                formExistingClient = '1';
            }

            const contentCategory = formData.get('x-fb-cd-content_category') as string | undefined;
            const consentCategory = formData.get('consent_category') as string | undefined;
            let isPopUp = form.getAttribute('data-is-popup');
            if (isPopUp === null || isPopUp === undefined || isPopUp === 'undefined' || isPopUp === 'null' || isPopUp === '') {
                isPopUp = 'false';
            }

            let formType = getFormType(form);
            if (formType === null || formType === undefined || formType === 'undefined' || formType === 'null' || formType === '') {
                formType = 'lead';
            }

            const formId = form.getAttribute('data-formid') || form.id;

            // Force string conversion to prevent any possibility of undefined/null
            const finalIsPopUp = String(isPopUp || 'false');
            const finalFormType = String(formType || 'lead');

            triggerFormSubmit({
                form_name: formName,
                form_transaction_id: transactionId,
                form_lead_source: formLeadSource,
                form_existing_client: formExistingClient as '0' | '1',
                'x-fb-cd-content_category': contentCategory,
                consent_category: consentCategory,
                is_pop_up: finalIsPopUp,
                form_type: finalFormType,
                form_id: formId,
                referrer: document.referrer || window.location.href,
                ...globalParams
            });

            // Generate Lead event
            triggerGenerateLead({
                form_name: formName,
                form_transaction_id: transactionId,
                form_lead_source: formLeadSource,
                leads: 1,
                ...globalParams
            });
        };

        // --- Event Handlers ---

        const handleSubmit = (event: SubmitEvent) => {
            const form = event.target as HTMLFormElement;
            if (!form) return;
            processFormSubmit(form);
        };

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target) return;

            const globalParams = getGlobalParams();

            // 1. Form Submit Click
            // Check for standard submit buttons OR the specific component wrapper/button requested
            const submitButton = target.closest('button[type="submit"], input[type="submit"], .submit-button, [data-component-type="submit_button"]');

            if (submitButton) {
                const form = submitButton.closest('form');
                if (form) {
                    const formIdentifier = `id:${form.id}|cls:${form.className}|name:${form.getAttribute('name')}`;

                    triggerFormSubmitClick({
                        form_identifier: formIdentifier,
                        ...globalParams
                    });

                    // Special handling: If this is a "submit_button" component, we might need to trigger submit manually
                    // if the native submit event doesn't fire (e.g. prevented by other scripts).
                    // We check validity first to avoid sending false positives.
                    if (submitButton.getAttribute('data-component-type') === 'submit_button' || submitButton.classList.contains('submit-button')) {
                        // We use a small timeout to allow native validation/submit to happen first.
                        // If the native submit fires, our deduplication in processFormSubmit will catch it.
                        setTimeout(() => {
                            if (form.checkValidity()) {
                                processFormSubmit(form);
                            } else {
                                // If invalid, trigger validation error
                                const formName = getFormName(form);
                                triggerFormValidationError({
                                    form_name: formName,
                                    form_transaction_id: transactionIds.current[formName],
                                    ...globalParams
                                });
                            }
                        }, 200);
                    }
                }
            }

            // 2. Contact Click (Phone/Email)
            const link = target.closest('a');
            if (link) {
                const href = link.getAttribute('href') || '';
                if (href.startsWith('tel:')) {
                    triggerContactClick({
                        contact_type: 'phone',
                        contact_text: link.innerText || href.replace('tel:', ''),
                        ...globalParams
                    });
                } else if (href.startsWith('mailto:')) {
                    triggerContactClick({
                        contact_type: 'email',
                        contact_text: link.innerText || href.replace('mailto:', ''),
                        ...globalParams
                    });
                }

                // 3. Navigation Click
                const nav = target.closest('nav, .navigation, .header-nav, [data-tracking="header-contact"], [data-component^="HeroBanner"]');
                if (nav) {
                    // Determine click element type
                    let clickElement = 'navigation link';
                    const isMainNav = nav.getAttribute('aria-label') === 'Main navigation' || nav.classList.contains('main-navigation');

                    if (nav.getAttribute('data-tracking') === 'header-contact') {
                        clickElement = 'navigation contact button';
                    } else if (nav.getAttribute('data-component')?.startsWith('HeroBanner')) {
                        clickElement = 'hero button';
                    } else if (isMainNav) {
                        clickElement = 'navigation product category';
                    }

                    triggerNavigationClick({
                        link_url: href,
                        click_text: link.innerText,
                        click_element: clickElement,
                        ...globalParams
                    });
                }

                // 4. LP CTA Click
                if (link.classList.contains('red-button') && href.includes('cws.com')) {
                    triggerClickLpCta({
                        ...globalParams
                    });
                }

                // 5. Select Content (Overview Table)
                const table = target.closest('[data-component="WysiwygTable"]');
                if (table) {
                    triggerSelectContent({
                        content_type: globalParams.solution_area || 'overview_table',
                        link_url: href,
                        ...globalParams
                    });
                }

                // 6. Footer CTA Click
                const footer = target.closest('[data-component="Footer"]');
                if (footer) {
                    triggerCTAClick({
                        link_url: href,
                        click_text: link.innerText,
                        click_element: 'Footer Link',
                        ...globalParams
                    });
                }
            }
        };

        const handleInput = (event: Event) => {
            const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
            if (!target) return;

            const form = target.closest('form');
            if (form) {
                const formName = getFormName(form);

                // Only fire form_touched once per form session
                if (!lastSubmitted.current[`touched_${formName}`]) {
                    triggerFormTouched({
                        form_name: formName,
                        ...getGlobalParams()
                    });
                    lastSubmitted.current[`touched_${formName}`] = Date.now();
                }
            }
        };

        const handleInvalid = (event: Event) => {
            const target = event.target as HTMLElement;
            const form = target.closest('form');
            if (form) {
                const formName = getFormName(form);
                triggerFormValidationError({
                    form_name: formName,
                    form_transaction_id: transactionIds.current[formName],
                    ...getGlobalParams()
                });
            }
        };

        // --- Observers ---

        // Form Visibility
        const formObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const form = entry.target as HTMLFormElement;
                    const formName = getFormName(form);

                    if (!lastSubmitted.current[`vis_${formName}`]) {
                        triggerFormVisibility({
                            form_name: formName,
                            ...getGlobalParams()
                        });
                        lastSubmitted.current[`vis_${formName}`] = Date.now();
                        formObserver.unobserve(form);
                    }
                }
            });
        }, { threshold: 0.5 });

        // Phone Visibility
        const phoneObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const link = entry.target as HTMLAnchorElement;
                    const phone = link.innerText || link.getAttribute('href')?.replace('tel:', '') || '';

                    if (!lastSubmitted.current[`vis_phone_${phone}`]) {
                        triggerPhoneVisibility({
                            phone: phone,
                            ...getGlobalParams()
                        });
                        lastSubmitted.current[`vis_phone_${phone}`] = Date.now();
                        phoneObserver.unobserve(link);
                    }
                }
            });
        }, { threshold: 0.33 });

        // --- Initialization ---

        const initObservers = () => {
            document.querySelectorAll('form').forEach(form => {
                const formName = getFormName(form);
                if (!lastSubmitted.current[`vis_${formName}`]) {
                    formObserver.observe(form);
                }
            });
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                const phone = (link as HTMLElement).innerText || link.getAttribute('href')?.replace('tel:', '') || '';
                if (!lastSubmitted.current[`vis_phone_${phone}`]) {
                    phoneObserver.observe(link);
                }
            });
        };

        // Attach Listeners
        document.addEventListener('submit', handleSubmit, true); // Capture
        document.addEventListener('click', handleClick, true);
        document.addEventListener('change', handleInput, true);
        document.addEventListener('invalid', handleInvalid, true);

        // Initialize observers
        initObservers();

        // Re-init observers on DOM changes
        const mutationObserver = new MutationObserver(() => {
            initObservers();
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            document.removeEventListener('submit', handleSubmit, true);
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('change', handleInput, true);
            document.removeEventListener('invalid', handleInvalid, true);
            router.events.off('routeChangeComplete', handleRouteChange);
            formObserver.disconnect();
            phoneObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    return (
        <>
            <GenericEventTracker />
            <ScrollTracker />
            <EnhancedScrollTracker />
            <NavigationTracker />
            <ContactTracker />
        </>
    );
};
