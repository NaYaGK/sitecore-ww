'use client';
import {
  RichText,
  Text,
  useSitecore,
  type Field,
  type ImageField,
} from '@sitecore-content-sdk/nextjs';

import { CardComponentProps } from './CardComponent.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

const hasImage = (image?: ImageField, isPageEditing?: boolean): boolean => {
  if (image?.value?.src) return true;
  return Boolean(isPageEditing);
};

type CardLayoutVariant = 'default' | 'horizontal';

interface CardLayoutProps extends CardComponentProps {
  variant: CardLayoutVariant;
}

const CardLayout: React.FC<CardLayoutProps> = (props) => {
  const { fields, rendering, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const imageField = fields?.Image;
  const titleField = fields?.Title;
  const descriptionField = fields?.Description;

  // Card requires at least title and description
  if (
    !titleField ||
    !descriptionField ||
    (!titleField.value && !isPageEditing) ||
    (!descriptionField.value && !isPageEditing)
  ) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'CardComponent'} />;
  }

  const showImage = hasImage(imageField, isPageEditing);
  const isHorizontalVariant = variant === 'horizontal';
  const cardClassName = cn(
    'flex flex-col max-w-[680px] max-h-[436px] bg-transparent rounded-none overflow-visible text-text font-body',
    'component',
    isHorizontalVariant ? 'card-component-horizontal' : 'card-component',
    !isHorizontalVariant && 'bg-bg-primary max-md:p-6 max-md:px-5 max-md:min-h-auto',
  );

  return (
    <article className={cardClassName} data-component="CardComponent" data-variant={variant}>
      <div
        className={cn(
          'flex flex-row items-start gap-6 max-md:flex-col max-md:gap-4',
          !isHorizontalVariant && 'h-full items-center max-md:items-start',
        )}
      >
        {showImage && imageField && (
          <div
            className={cn(
              'flex h-20 w-20 shrink-0 items-center justify-center max-md:h-16 max-md:w-16',
            )}
          >
            <div className="image-container">
              <img
                src={imageField?.value?.src}
                alt={titleField?.value ?? 'Card image'}
                className="block h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <Text
            tag="h3"
            className="font-heading-h3 text-text m-0 mb-4 text-2xl leading-[1.3] font-bold"
            field={titleField}
          />

          <div
            className={cn(
              'text-text text-base opacity-90 max-md:text-[0.9375rem]',
              '[&_p]:mb-3 [&_p:last-child]:mb-0',
              '[&_ul]:mb-3 [&_ul]:pl-6 [&_ul:last-child]:mb-0',
              '[&_ol]:mb-3 [&_ol]:pl-6 [&_ol:last-child]:mb-0',
              '[&_li]:mb-2 [&_li:last-child]:mb-0',
            )}
          >
            <RichText field={descriptionField} />
          </div>
        </div>
      </div>
    </article>
  );
};

export const Default: React.FC<CardComponentProps> = (props) => (
  <CardLayout {...props} variant="default" />
);

export const Horizontal: React.FC<CardComponentProps> = (props) => (
  <CardLayout {...props} variant="horizontal" />
);

export default Default;
