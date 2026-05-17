// Type definitions for Breadcrumb Component

export interface NavigationFilterItem {
    id: string;
    name: string;
    displayName: string;
}

export interface PageFields {
    navigationLinkCaption?: { value: string };
    hideInNavigationFilters?: {
        targetItems: NavigationFilterItem[];
    };
}

export interface RouteItem {
    id: string;
    name: string;
    displayName?: string;
    url: { path: string };
    fields?: PageFields;
}

export interface RouteWithAncestors extends RouteItem {
    ancestors?: RouteItem[];
}

export interface BreadcrumbLink {
    id: string;
    url: string;
    title: string;
}
