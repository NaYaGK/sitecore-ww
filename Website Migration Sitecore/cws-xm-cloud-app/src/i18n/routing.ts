import sitecoreConfig from 'sitecore.config';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, validateLocaleConfig } from '@/config/locales';

const defaultLocale = sitecoreConfig.defaultLanguage || DEFAULT_LOCALE;
validateLocaleConfig(defaultLocale);

export const routing = {
    locales: [...SUPPORTED_LOCALES],
    defaultLocale,
};
