const LOCALE_SEGMENT_REGEX = /^[a-z]{2}(?:-[a-z]{2})?$/i;

export function isHomePath(pathname?: string | null): boolean {
  if (!pathname) return false;

  const cleanPath = pathname.split('?')[0]?.split('#')[0] ?? '';
  const segments = cleanPath.split('/').filter(Boolean);

  if (segments.length === 0) return true;
  if (segments.length === 1) {
    const segment = segments[0]?.toLowerCase();
    return segment === 'home' || LOCALE_SEGMENT_REGEX.test(segment ?? '');
  }

  if (segments.length === 2) {
    const [first, second] = segments;
    return (
      LOCALE_SEGMENT_REGEX.test(first ?? '') &&
      (second?.toLowerCase() === 'home' || second?.toLowerCase() === 'start')
    );
  }

  return false;
}

export function isCwsHomePage(params: {
  siteName?: string | null;
  routeName?: string | null;
  pathname?: string | null;
}): boolean {
  const site = params.siteName?.toLowerCase().trim();
  if (site !== 'cws') return false;

  const route = params.routeName?.toLowerCase().trim();
  if (route === 'home' || route === 'start') return true;

  return isHomePath(params.pathname);
}
