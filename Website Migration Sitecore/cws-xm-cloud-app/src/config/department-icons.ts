const DEPARTMENT_ICON_BY_PATH_SEGMENT: Record<string, string> = {
  hygiene: '/assets/department-icons/hygiene.svg',
  arbeitskleidung: '/assets/department-icons/workwear.svg',
  brandschutz: '/assets/department-icons/fire-safety.svg',
  reinraum: '/assets/department-icons/cleanrooms.svg',
  healthcare: '/assets/department-icons/healthcare.svg',
  fussmatten: '/assets/department-icons/floorcare.svg',
};

const DEPARTMENT_ICON_BY_TITLE: Record<string, string> = {
  'cws hygiene': '/assets/department-icons/hygiene.svg',
  'cws workwear': '/assets/department-icons/workwear.svg',
  'cws fire safety': '/assets/department-icons/fire-safety.svg',
  'cws cleanrooms': '/assets/department-icons/cleanrooms.svg',
  'cws healthcare': '/assets/department-icons/healthcare.svg',
  'cws floorcare': '/assets/department-icons/floorcare.svg',
};

const normalizeKey = (value: string): string => value.trim().toLowerCase();

const extractPathSegments = (href: string): string[] => {
  if (!href) return [];

  try {
    const parsedUrl = href.startsWith('http') ? new URL(href) : new URL(href, 'https://www.cws.com');
    return parsedUrl.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.toLowerCase());
  } catch {
    const sanitizedHref = href.split('?')[0] ?? '';
    const sanitizedHashlessHref = sanitizedHref.split('#')[0] ?? '';
    return sanitizedHashlessHref
      .split('/')
      .filter(Boolean)
      .map((segment) => segment.toLowerCase());
  }
};

export const getDepartmentIconPath = (href?: string, title?: string): string | undefined => {
  const segments = href ? extractPathSegments(href) : [];
  const fromPath = segments
    .map((segment) => DEPARTMENT_ICON_BY_PATH_SEGMENT[segment])
    .find(Boolean);

  if (fromPath) return fromPath;
  if (!title) return undefined;

  return DEPARTMENT_ICON_BY_TITLE[normalizeKey(title)];
};

export { DEPARTMENT_ICON_BY_PATH_SEGMENT, DEPARTMENT_ICON_BY_TITLE };
