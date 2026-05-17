import { sendGTMEvent } from './gtm';

// Helper to generate transaction ID: [timestamp]-[random_generated_id]
export const generateTransactionId = () => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 1000000000);
    return `${timestamp}-${randomId}`;
};

// --- Event Interfaces ---

export interface FormSubmitEvent {
    event: 'form_submit';
    form_name: string;
    form_transaction_id: string;
    form_lead_source: string;
    form_existing_client: '0' | '1';
    'x-fb-cd-content_category'?: string;
    consent_category?: string;
    is_pop_up?: string;
    form_type?: string;
    form_id?: string;
    referrer?: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface GenerateLeadEvent {
    event: 'generate_lead';
    form_name: string;
    form_transaction_id: string;
    form_lead_source: string;
    leads: number;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface FormSubmitClickEvent {
    event: 'form_submit_click';
    event_tag_timestamp: number;
    form_identifier: string;
    [key: string]: any;
}

export interface FormTouchedEvent {
    event: 'form_touched';
    form_name: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface FormVisibilityEvent {
    event: 'form_visibility';
    form_name: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface FormSearchEvent {
    event: 'form_search';
    search_term: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface PhoneVisibilityEvent {
    event: 'phone_visibility';
    phone: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface ContactClickEvent {
    event: 'contact_click';
    contact_type: 'phone' | 'email';
    contact_text: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface SelectContentEvent {
    event: 'select_content';
    content_type: string;
    link_url: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface FormValidationErrorEvent {
    event: 'form_validation_error';
    form_name: string;
    form_transaction_id?: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface ClickLpCtaEvent {
    event: 'click_lp_cta';
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface NavigationClickEvent {
    event: 'navigation_click';
    link_url: string;
    click_text: string;
    click_element: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface InfinityCallConnectedEvent {
    event: 'infinity_call_connected';
    contact_text: string;
    form_lead_source: string;
    page_location: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface InfinityCallNotConnectedEvent {
    event: 'infinity_call_notconnected';
    contact_text: string;
    form_lead_source: string;
    page_location: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface InfinityCallQualifiedEvent {
    event: 'infinity_call_qualified';
    contact_text: string;
    form_lead_source: string;
    page_location: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface InfinityCallLeadEvent {
    event: 'infinity_call_lead';
    contact_text: string;
    form_lead_source: string;
    page_location: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface VWOExperienceImpressionEvent {
    event: 'vwo_experience_impression';
    exp_variant_string: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface ChatbotEvent {
    event: string; // chatbot_{event name}
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface CTAClickEvent {
    event: 'CTA_Click';
    link_url: string;
    click_text: string;
    click_element: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

export interface PageViewEvent {
    event: 'page_view';
    page_location: string;
    page_title: string;
    event_tag_timestamp: number;
    [key: string]: any;
}

// --- Trigger Functions ---

export const triggerFormSubmit = (data: Omit<FormSubmitEvent, 'event'>) => {
    sendGTMEvent({
        event: 'form_submit',
        ...data,
    });
};

export const triggerGenerateLead = (data: Omit<GenerateLeadEvent, 'event'>) => {
    sendGTMEvent({
        event: 'generate_lead',
        ...data,
    });
};

export const triggerFormSubmitClick = (data: Omit<FormSubmitClickEvent, 'event'>) => {
    sendGTMEvent({
        event: 'form_submit_click',
        ...data,
    });
};

export const triggerFormTouched = (data: Omit<FormTouchedEvent, 'event'>) => {
    sendGTMEvent({
        event: 'form_touched',
        ...data,
    });
};

export const triggerFormVisibility = (data: Omit<FormVisibilityEvent, 'event'>) => {
    sendGTMEvent({
        event: 'form_visibility',
        ...data,
    });
};

export const triggerFormSearch = (data: Omit<FormSearchEvent, 'event'>) => {
    sendGTMEvent({
        event: 'form_search',
        ...data,
    });
};

export const triggerPhoneVisibility = (data: Omit<PhoneVisibilityEvent, 'event'>) => {
    sendGTMEvent({
        event: 'phone_visibility',
        ...data,
    });
};

export const triggerContactClick = (data: Omit<ContactClickEvent, 'event'>) => {
    sendGTMEvent({
        event: 'contact_click',
        ...data,
    });
};

export const triggerSelectContent = (data: Omit<SelectContentEvent, 'event'>) => {
    sendGTMEvent({
        event: 'select_content',
        ...data,
    });
};

export const triggerFormValidationError = (data: Omit<FormValidationErrorEvent, 'event'>) => {
    sendGTMEvent({
        event: 'form_validation_error',
        ...data,
    });
};

export const triggerClickLpCta = (data: Omit<ClickLpCtaEvent, 'event'>) => {
    sendGTMEvent({
        event: 'click_lp_cta',
        ...data,
    });
};

export const triggerNavigationClick = (data: Omit<NavigationClickEvent, 'event'>) => {
    sendGTMEvent({
        event: 'navigation_click',
        ...data,
    });
};

export const triggerPageView = (data: Omit<PageViewEvent, 'event'>) => {
    sendGTMEvent({
        event: 'page_view',
        ...data,
    });
};

export const triggerCTAClick = (data: Omit<CTAClickEvent, 'event'>) => {
    sendGTMEvent({
        event: 'CTA_Click',
        ...data,
    });
};
