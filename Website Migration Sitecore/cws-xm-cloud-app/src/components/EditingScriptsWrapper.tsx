'use client';

import dynamic from 'next/dynamic';

/**
 * Client component wrapper for EditingScripts.
 * EditingScripts uses React context and must be rendered in a client component.
 *
 * Using dynamic import with ssr: false to prevent errors during static generation.
 * This is safe because editing mode is always client-side, so EditingScripts will
 * load when needed in the browser.
 */
const EditingScripts = dynamic(
  () => import('@sitecore-content-sdk/nextjs').then((mod) => ({ default: mod.EditingScripts })),
  { ssr: false },
);

export function EditingScriptsWrapper() {
  return <EditingScripts />;
}
