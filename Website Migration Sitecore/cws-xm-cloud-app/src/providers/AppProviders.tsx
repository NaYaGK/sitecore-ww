'use client';

import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { VideoProvider } from '@/contexts/VideoContext';
import { I18nProvider } from 'next-localization';
import { dictionaryKeys, mockDictionary } from '@/variables/dictionary';

export const AppProviders = ({ children }: { children: ReactNode }) => {
  const dictionary = mockDictionary(dictionaryKeys);

  return (
    <I18nProvider lngDict={dictionary} locale="en">
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <VideoProvider>{children}</VideoProvider>
      </ThemeProvider>
    </I18nProvider>
  );
};
