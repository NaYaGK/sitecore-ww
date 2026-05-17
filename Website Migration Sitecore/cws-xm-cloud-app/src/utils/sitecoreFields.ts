import type { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export const hasFieldValue = <T>(field?: Field<T> | null): field is Field<T> => {
  return field !== null && field !== undefined && field.value !== undefined && field.value !== null;
};

export const hasLinkField = (field?: LinkField | null): field is LinkField => {
  return Boolean(field?.value?.href);
};

export const getLinkFieldOrFallback = (
  field?: LinkField | null,
  fallback?: LinkField | null
): LinkField | undefined => {
  if (hasLinkField(field)) {
    return field;
  }

  if (hasLinkField(fallback)) {
    return fallback;
  }

  return undefined;
};



export const getStringValue = (field: Field<string> | string | undefined): string | undefined => {
  if (!field) return undefined;
  return typeof field === 'string' ? field : field.value;
};

export const getBoolValue = (field: Field<boolean> | undefined): boolean => {
  if (!field || field.value === undefined || field.value === null) return false;
  if (typeof field.value === 'boolean') return field.value;
  const val = String(field.value).toLowerCase();
  return val === 'true' || val === '1';
};
