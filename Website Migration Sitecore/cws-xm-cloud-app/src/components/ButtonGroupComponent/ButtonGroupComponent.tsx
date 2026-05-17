import React from 'react';
import { Link, Text, useSitecore, type LinkField, type Field } from '@sitecore-content-sdk/nextjs';
import { ButtonGroupComponentProps, ButtonGroupVariant } from './ButtonGroupComponent.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';

/**
 * Helper function to extract LinkField from Sitecore field pattern
 * Handles both jsonValue and direct value patterns with null safety
 */
const extractLinkField = (
  field: LinkField | { jsonValue?: LinkField; value?: LinkField['value'] } | undefined,
): LinkField | undefined => {
  if (!field) return undefined;
  if ('jsonValue' in field && (field as any).jsonValue) {
    return (field as any).jsonValue as LinkField;
  }
  return field as LinkField | undefined;
};

/**
 * Helper function to extract TextField from Sitecore field pattern
 * Handles both jsonValue and direct value patterns with null safety
 */
const extractTextField = (
  field: Field<string> | { jsonValue?: Field<string>; value?: string } | undefined,
): Field<string> | undefined => {
  if (!field) return undefined;
  if ('jsonValue' in field && (field as any).jsonValue) {
    return (field as any).jsonValue as Field<string>;
  }
  return field as Field<string> | undefined;
};

/**
 * Helper function to safely get text value from LinkField
 */
const getLinkText = (linkField: LinkField | undefined): string => {
  if (!linkField?.value) return '';
  const text = linkField.value.text;
  const description = linkField.value.description;
  // Ensure we return a string, handling cases where text/description might be other types
  return (
    (typeof text === 'string' ? text : '') ||
    (typeof description === 'string' ? description : '') ||
    ''
  );
};

/**
 * Helper function to safely get text value from TextField
 */
const getTextFieldValue = (textField: Field<string> | undefined): string => {
  if (!textField?.value) return '';
  return textField.value;
};

const ButtonGroupComponentLayout: React.FC<
  ButtonGroupComponentProps & { variant: ButtonGroupVariant }
> = (props) => {
  const { fields, rendering, variant } = props;

  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  // Check for reduce-margintop style param
  const styles = rendering?.params?.Styles || '';
  const hasReduceMarginTop = styles.includes('reduce-margintop');

  // Access datasource - handle both direct fields and fields.data.datasource patterns
  const datasource = fields?.data?.datasource || fields;

  // Get items array with proper type safety and null checks
  const items = Array.isArray(datasource?.Items)
    ? datasource.Items
    : Array.isArray(fields?.Items)
      ? fields.Items
      : [];
  const hasItems = items.length > 0;

  // Show placeholder in edit mode if no items
  if (isPageEditing && !hasItems) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'ButtonGroupComponent'} />;
  }

  // Don't render if no items in normal mode
  if (!hasItems) {
    return null;
  }

  return (
    <div
  className={cn(
    'mx-auto flex max-w-[1360px] flex-wrap gap-4 px-2',

    // Default margins (for everything except Popup)
    variant !== 'Popup' && 'my-5 md:mt-10 md:mb-8',

    // Custom margins for Popup (CHANGE THESE VALUES as you like)
    variant === 'Popup' && 'mb-[48px] lg-[72px] md:pt-8',

    variant === 'news' && 'news-tags',
  )}
  data-component="ButtonGroupComponent"
>
      {items.map((item, index) => {
        // Extract fields with proper null safety
        const linkField = extractLinkField(item.fields?.Link);
        const linkTextField = extractTextField(item.fields?.LinkText);

        // Check if link field exists (required for rendering)
        // In editing mode, show even if link is empty
        if (!linkField && !isPageEditing) {
          return null;
        }

        // Get link text - prioritize LinkText field, then General Link field text, then fallback
        // Use helper functions for null safety
        const linkTextValue = linkTextField ? getTextFieldValue(linkTextField) : '';
        const linkTextFromField = linkField ? getLinkText(linkField) : '';
        const linkText = linkTextValue || linkTextFromField || item.displayName || item.name || '';

        // Extract background color
        const buttonBgColorField = extractTextField(item.fields?.ButtonBackgroundColor);
        const buttonBgColor = buttonBgColorField ? getTextFieldValue(buttonBgColorField) : undefined;

        // Extract text color
        const textColorField = extractTextField(item.fields?.TextColor);
        const textColor = textColorField ? getTextFieldValue(textColorField) : undefined;

        // If color is present, use it. Otherwise rely on CSS helper classes (currently bg-transparent is in className)
        const customStyle = {
          ...(buttonBgColor ? { backgroundColor: buttonBgColor, borderColor: buttonBgColor } : {}),
          ...(textColor ? { color: textColor } : {}),
        };

        // Calculate precise hover text color based on user request:
        // "Checking the text color field if it is black put white on hover and vice versa"
        // Background color remains unchanged on hover for custom backgrounds.
        const effectiveTextColor = (textColor || 'black').toLowerCase();
        const isBlackText = effectiveTextColor === 'black' || effectiveTextColor === '#000000';
        const hoverTextColor = isBlackText ? 'white' : 'black';

        const finalStyle = buttonBgColor ? { ...customStyle, '--hover-text': hoverTextColor } as React.CSSProperties : customStyle;
        // If we have a custom BG color, we might want to ensure text color is readable/white, or assume user handles it.
        // User request "make this button color whatever it is passing... currently it is transparent".
        // Existing classes:
        // border-2 border-black bg-transparent ... text-black ... hover:bg-black hover:text-white

        // If custom color is provided, we should probably override the default border/bg
        // and ideally handle text color, but for now let's just set background and border.
        // To make sure it overrides 'bg-transparent', inline style is good.
        // We also need to consider hover state. Inline styles are hard to hover.
        // However, user just asked for the "button color whatever it is passing".
        // Let's set the style prop.

        // Generate unique key with proper fallback
        const itemKey = item.id || item.uid || `button-${index}`;

        // Only render if we have a valid linkField (required for Link component)
        if (!linkField) {
          return null;
        }

        // Render as button if variant is Popup
        if (variant === 'Popup') {
          return (
            <button
              key={itemKey}
              type="button"
              onClick={() => openContactFormModal()}
              style={finalStyle}
              className={cn(
                "cursor-pointer inline-flex items-center justify-center rounded-[18px] border-2 border-black px-[40px] py-[9px] text-center text-[16px] leading-[25px] font-bold text-black transition-colors duration-200 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none lg:text-[18px] lg:leading-[28px] lg:px-[50px] xl:text-[20px] xl:px-[60px]",
                !buttonBgColor && "bg-transparent hover:bg-black hover:text-white",
                buttonBgColor && "hover:!text-[var(--hover-text)]"
              )}
            >
              {linkTextField ? <Text field={linkTextField} /> : <span>{linkText}</span>}
            </button>
          );
        }
        // Render as button if variant is news
        if (variant === 'news') {
          return (
            <Link
              key={itemKey}
              field={linkField}
              type="button"
              className="font-bold inline-block h-[47px] cursor-pointer rounded-[18px] border-2 border-solid border-black bg-transparent px-[40px] py-[9px] text-center text-[14px] leading-[25px] text-black no-underline transition-all duration-100 ease-in-out break-words lg:h-[50px] lg:leading-[28px] hover:bg-black hover:text-white cursor-pointer"
            >
              {linkTextField ? <Text field={linkTextField} /> : <span>{linkText}</span>}
            </Link>
          );
        }
        return (
          <Link
            key={itemKey}
            field={linkField}
            style={finalStyle}
            className={cn(
              "cursor-pointer inline-flex items-center justify-center rounded-[18px] border-2 border-black px-[40px] py-[9px] text-center text-[16px] leading-[25px] font-bold text-black transition-colors duration-200 focus:ring-2 focus:ring-black focus:ring-offset-2 focus:outline-none lg:text-[18px] lg:leading-[28px] lg:px-[50px] xl:text-[20px] xl:px-[60px]",
              !buttonBgColor && "bg-transparent hover:bg-black hover:text-white",
              buttonBgColor && "hover:!text-[var(--hover-text)]"
            )}
          >
            {/* Use Text component for link text if LinkText field exists (makes it editable in Pages) */}
            {/* Otherwise, display text from General Link field - the field prop on Link makes it editable */}
            {linkTextField ? <Text field={linkTextField} /> : <span>{linkText}</span>}
          </Link>
        );
      })}
    </div>
  );
};

export const Default: React.FC<ButtonGroupComponentProps> = (props) => (
  <ButtonGroupComponentLayout {...props} variant="default" />
);

export const News: React.FC<ButtonGroupComponentProps> = (props) => (
  <ButtonGroupComponentLayout {...props} variant="news" />
);
export const Popup: React.FC<ButtonGroupComponentProps> = (props) => (
  <ButtonGroupComponentLayout {...props} variant="Popup" />
);

export default Default;
