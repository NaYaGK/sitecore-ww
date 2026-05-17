import React from 'react';
import { FEaaSWrapper } from '@sitecore-content-sdk/nextjs';

export const SitecoreForm = (props: any) => {
  // Recursively resolve the component in case of multiple default wrappers (ESM/CJS interop)
  let Component = FEaaSWrapper;
  while (Component && typeof Component === 'object' && 'default' in Component) {
    Component = (Component as any).default;
  }

  // Safety check: ensure we have a valid component (function or class)
  if (!Component || (typeof Component !== 'function' && typeof Component !== 'string')) {
    return null;
  }

  // @ts-ignore
  return <Component {...props} />;
};

export default SitecoreForm;
