'use client';

import { useEffect, useState } from 'react';
import {
  fetchGlobalSearchSettings,
  type GlobalSearchSettings,
} from '@/services/search/search-settings.service';

const EMPTY_SETTINGS: GlobalSearchSettings = {
  site: {},
  job: {},
};

export const useGlobalSearchSettings = (
  siteName: string,
): GlobalSearchSettings => {
  const [settings, setSettings] = useState<GlobalSearchSettings>(EMPTY_SETTINGS);

  useEffect(() => {
    let active = true;
    setSettings(EMPTY_SETTINGS);

    fetchGlobalSearchSettings(siteName)
      .then((response) => {
        if (!active) return;
        setSettings(response);
      })
      .catch(() => {
        if (!active) return;
        setSettings(EMPTY_SETTINGS);
      });

    return () => {
      active = false;
    };
  }, [siteName]);

  return settings;
};
