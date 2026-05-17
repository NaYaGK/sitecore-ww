export const normalizeJobCountryCode = (value?: string | null): string => {
  return (value || '')
    .trim()
    .toUpperCase()
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-');
};

export const splitJobCountryCode = (value?: string | null): string[] => {
  return normalizeJobCountryCode(value)
    .split('-')
    .map((part) => part.trim())
    .filter(Boolean);
};

const LOCALE_LANGUAGE_TO_JOB_COUNTRY_CODE: Record<string, string> = {
  de: 'DE',
  ro: 'RO',
};

export const resolveJobCountryCodesForLocale = (
  language?: string | null,
  country?: string | null,
): string[] => {
  const normalizedLanguage = (language || '').trim().toLowerCase();
  const normalizedCountry = normalizeJobCountryCode(country);

  const mappedFromLanguage = LOCALE_LANGUAGE_TO_JOB_COUNTRY_CODE[normalizedLanguage];
  const resolved = mappedFromLanguage || normalizedCountry;

  return resolved ? [resolved] : [];
};

export const matchesJobCountryCode = (
  jobCountryCode?: string | null,
  requestedCountryCode?: string | null,
): boolean => {
  const normalizedRequested = normalizeJobCountryCode(requestedCountryCode);
  if (!normalizedRequested) {
    return true;
  }

  const normalizedJobCountry = normalizeJobCountryCode(jobCountryCode);
  if (!normalizedJobCountry) {
    return false;
  }

  if (normalizedJobCountry === normalizedRequested) {
    return true;
  }

  const requestedParts = new Set(splitJobCountryCode(normalizedRequested));
  const jobParts = splitJobCountryCode(normalizedJobCountry);

  return jobParts.some((part) => requestedParts.has(part));
};

export const matchesAnyJobCountryCode = (
  jobCountryCode?: string | null,
  requestedCountryCodes: string[] = [],
): boolean => {
  if (requestedCountryCodes.length === 0) {
    return true;
  }

  return requestedCountryCodes.some((requestedCode) =>
    matchesJobCountryCode(jobCountryCode, requestedCode),
  );
};
