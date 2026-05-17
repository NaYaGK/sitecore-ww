import { Text, useSitecore, type Field } from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';

interface SimpleHeadingProps {
  rendering: {
    componentName?: string;
    dataSource?: string;
    fields?: {
      [key: string]: any;
    };
    params?: {
      [key: string]: string;
    };
    [key: string]: any;
  };
  fields?: {
    [key: string]: any;
    data?: {
      datasource?: {
        [key: string]: any;
      };
    };
  };
  params?: {
    [key: string]: string;
  };
  className?: string;
}

const VALID_HEADING_LEVELS = ['H2', 'H3', 'H4'] as const;
type HeadingLevel = (typeof VALID_HEADING_LEVELS)[number];

// Helper to normalize field values
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

const normalizeHeadingLevel = (level?: string): HeadingLevel => {
  if (!level) return 'H2';
  const value = level.trim().toUpperCase();
  return (VALID_HEADING_LEVELS as readonly string[]).includes(value)
    ? (value as HeadingLevel)
    : 'H2';
};

const hasContent = (field?: Field<string>, isEditing?: boolean): boolean => {
  if (!field) return false;
  const value = field.value;
  return (typeof value === 'string' && value.trim().length > 0) || Boolean(isEditing);
};

// Helper to handle case-insensitive property access
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

const SimpleHeading: React.FC<SimpleHeadingProps> = (props) => {
  const { fields: initialFields = {}, rendering = {}, className } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  // Resolve datasource from multiple shapes and unwrap nested fields
  const initialDs =
    initialFields?.data?.datasource ??
    initialFields?.datasource ??
    initialFields ??
    rendering?.fields ??
    {};

  const ds =
    initialDs && typeof initialDs === 'object' && 'fields' in initialDs
      ? initialDs.fields
      : initialDs;

  // Get fields with fallbacks
  const headingText = asTextField(pickCI(ds, ['HeadingText', 'headingText']));
  const headingLevel = (pickCI(ds, ['HeadingLevel', 'headingLevel']) as any)?.value || 'H2';

  // Show fallback only in editing mode without a datasource
  if (isPageEditing && !rendering.dataSource) {
    return <NoDataFallback componentName="Simple Heading" />;
  }

  const normalizedLevel = normalizeHeadingLevel(headingLevel);

  if (!hasContent(headingText, isPageEditing)) {
    return null;
  }

  const headingClassName = cn('heading font-heading py-16 font-bold italic', {
    'text-[20px] md:text-[22px] mb-4': normalizedLevel === 'H2',
    'text-[20px] md:text-[22px] mb-3': normalizedLevel === 'H3',
    'text-[20px] md:text-[22px] mb-2': normalizedLevel === 'H4',
  });

  return (
    <div className="w-full" data-component="SimpleHeading" data-source-id={rendering?.dataSource}>
      <div className="mx-auto max-w-[1360px] px-12 md:pl-16">
        {normalizedLevel === 'H2' && (
          <h2 className={headingClassName}>
            <Text field={headingText} className="font-heading-h2" tag={undefined} />
          </h2>
        )}
        {normalizedLevel === 'H3' && (
          <h3 className={headingClassName}>
            <Text field={headingText} className="font-heading-h3" tag={undefined} />
          </h3>
        )}
        {normalizedLevel === 'H4' && (
          <h4 className={headingClassName}>
            <Text field={headingText} className="font-heading-h4" tag={undefined} />
          </h4>
        )}
      </div>
    </div>
  );
};

export default SimpleHeading;
