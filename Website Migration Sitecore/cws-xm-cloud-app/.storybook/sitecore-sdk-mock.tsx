// Mock for @sitecore-content-sdk/nextjs in Storybook
import React from 'react';

// Mock useSitecore hook
export const useSitecore = () => ({
  page: {
    mode: {
      isEditing: false,
      isPreview: false,
      isNormal: true,
    },
    itemId: 'mock-item-id',
    itemLanguage: 'en',
    itemVersion: 1,
    route: {
      name: 'mock-route',
      displayName: 'Mock Route',
      fields: {},
      databaseName: 'master',
      deviceId: 'mock-device-id',
      itemId: 'mock-item-id',
      itemLanguage: 'en',
      itemVersion: 1,
      layoutId: 'mock-layout-id',
      templateId: 'mock-template-id',
      templateName: 'mock-template',
      placeholders: {},
    },
  },
  site: {
    name: 'mock-site',
  },
});

// Mock Text component
export const Text = ({ field, tag = 'span', editable = false, className, ...props }: any) => {
  const Tag = tag as React.ElementType;
  const value = field?.value ?? field?.jsonValue?.value ?? '';
  return (
    <Tag className={className} {...props}>
      {value}
    </Tag>
  );
};

// Mock RichText component
export const RichText = ({ field, tag = 'div', editable = false, className, ...props }: any) => {
  const Tag = tag as React.ElementType;
  const value = field?.value ?? field?.jsonValue?.value ?? '';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} {...props} />;
};

// Mock Link component
export const Link = ({ field, children, className, ...props }: any) => {
  const href = field?.value?.href ?? field?.jsonValue?.value?.href ?? '#';
  const text = field?.value?.text ?? field?.jsonValue?.value?.text ?? '';
  return (
    <a href={href} className={className} {...props}>
      {children || text}
    </a>
  );
};

// Mock Image component
export const Image = ({ field, className, ...props }: any) => {
  const src = field?.value?.src ?? field?.jsonValue?.value?.src ?? '';
  const alt = field?.value?.alt ?? field?.jsonValue?.value?.alt ?? '';
  return <img src={src} alt={alt} className={className} {...props} />;
};

// Mock Placeholder component
export const Placeholder = ({ name, rendering, ...props }: any) => {
  return <div data-placeholder={name} {...props} />;
};

// Mock SitecoreProvider component
export const SitecoreProvider = ({ children }: any) => {
  return <>{children}</>;
};

// Mock LayoutServicePageState enum
export enum LayoutServicePageState {
  Normal = 'normal',
  Preview = 'preview',
  Edit = 'edit',
}

// Mock getFieldValue utility
export const getFieldValue = (field: any, defaultValue: any = '') => {
  return field?.value ?? field?.jsonValue?.value ?? defaultValue;
};

// Export types (these won't be used at runtime but help with TypeScript)
export type Field<T = string> = any;
export type LinkField = any;
export type ImageField = any;
export type ComponentRendering = any;
export type ComponentParams = any;
export type Page = any;
export type ComponentMap = any;
export type LinkFieldValue = any;
export type RichTextField = any;
export type ComponentFields = any;
