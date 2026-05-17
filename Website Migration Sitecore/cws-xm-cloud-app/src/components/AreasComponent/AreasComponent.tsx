'use client';

import type React from 'react';
import { useState, useMemo } from 'react';
import {
  Link,
  Text,
  RichText,
  Image,
  useSitecore,
  type Field,
  type ImageField,
  type LinkField,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';

import { AreasComponentProps, AreaCardItem } from './AreasComponent.props';
import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { useLocale } from '@/hooks/useLocale';
// Import types for helper functions
type SitecoreImageField = ImageField | { jsonValue?: ImageField; value?: ImageField['value'] };
type SitecoreLinkField = LinkField | { jsonValue?: LinkField; value?: LinkField['value'] };

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ChevronRight } from 'lucide-react';

/**
 * Type-safe helper to normalize field for Sitecore SDK components
 * Prefers jsonValue (Layout Service) over direct field for PageEditor compatibility
 *
 * Security Note: This function only extracts and normalizes field objects.
 * All content sanitization is handled by Sitecore SDK components (Text, RichText, Image, Link).
 * These components are the only way user-generated content is rendered, ensuring XSS protection.
 */
function getFieldForComponent<TField>(
  field: TField | { jsonValue?: TField; value?: unknown } | undefined,
): TField | undefined {
  // Input validation: ensure field exists and is a valid object type
  if (!field || (typeof field !== 'object' && typeof field !== 'string')) return undefined;

  // Only process if field is an object (strings are passed through as-is for primitive field types)
  if (typeof field === 'object') {
    // Handle jsonValue pattern (from Layout Service) - prefer for PageEditor compatibility
    if ('jsonValue' in field && field.jsonValue) {
      return field.jsonValue;
    }
  }

  // Handle direct field pattern or primitive string values
  return field as TField;
}

/**
 * Type-safe helper to check if an ImageField has a source value
 */
function hasImageSource(field: SitecoreImageField | undefined): boolean {
  if (!field || typeof field !== 'object') return false;
  // Check jsonValue first (Layout Service pattern)
  if ('jsonValue' in field && field.jsonValue && typeof field.jsonValue === 'object') {
    if ('value' in field.jsonValue && field.jsonValue.value) {
      return Boolean(field.jsonValue.value.src);
    }
  }
  // Check direct ImageField pattern
  if ('value' in field && field.value) {
    return Boolean(field.value.src);
  }
  return false;
}

/**
 * Type-safe helper to check if a LinkField has an href value
 */
function hasLinkHref(field: SitecoreLinkField | undefined): boolean {
  if (!field || typeof field !== 'object') return false;
  // Check jsonValue first (Layout Service pattern)
  if ('jsonValue' in field && field.jsonValue && typeof field.jsonValue === 'object') {
    if ('value' in field.jsonValue && field.jsonValue.value) {
      return Boolean(field.jsonValue.value.href);
    }
  }
  // Check direct LinkField pattern
  if ('value' in field && field.value) {
    return Boolean(field.value.href);
  }
  return false;
}

/**
 * Type-safe helper to get link text from a LinkField
 */
function getLinkText(field: SitecoreLinkField | undefined): string | undefined {
  if (!field || typeof field !== 'object') return undefined;
  // Check jsonValue first (Layout Service pattern)
  if ('jsonValue' in field && field.jsonValue && typeof field.jsonValue === 'object') {
    if (
      'value' in field.jsonValue &&
      field.jsonValue.value &&
      typeof field.jsonValue.value === 'object'
    ) {
      return field.jsonValue.value.text;
    }
  }
  // Check direct LinkField pattern
  if ('value' in field && field.value && typeof field.value === 'object') {
    return field.value.text;
  }
  return undefined;
}

/**
 * Calculate SVG path for a donut sector with translation effect
 * @param startAngle - Starting angle in degrees
 * @param endAngle - Ending angle in degrees
 * @param outerRadius - Outer radius of the donut
 * @param innerRadius - Inner radius of the donut
 * @param isActive - Whether this sector is currently active (for popup effect)
 * @returns Object with SVG path string and translation coordinates
 */
const createDonutSectorPath = (
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  innerRadius: number,
  isActive: boolean,
): { path: string; translateX: number; translateY: number } => {
  // Convert angles to radians
  const startRad = ((startAngle - 90) * Math.PI) / 180;
  const endRad = ((endAngle - 90) * Math.PI) / 180;
  const midAngle = (((startAngle + endAngle) / 2 - 90) * Math.PI) / 180;

  // Calculate translation distance for active sector (outward from center)
  const translateDistance = isActive ? 50 : 0;
  const translateX = translateDistance * Math.cos(midAngle);
  const translateY = translateDistance * Math.sin(midAngle);

  // Calculate outer arc points
  const x1 = outerRadius * Math.cos(startRad);
  const y1 = outerRadius * Math.sin(startRad);
  const x2 = outerRadius * Math.cos(endRad);
  const y2 = outerRadius * Math.sin(endRad);

  // Calculate inner arc points
  const x3 = innerRadius * Math.cos(endRad);
  const y3 = innerRadius * Math.sin(endRad);
  const x4 = innerRadius * Math.cos(startRad);
  const y4 = innerRadius * Math.sin(startRad);

  // Determine if arc should be large
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  const path = `M ${x1},${y1} A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${x2},${y2} L ${x3},${y3} A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 0 ${x4},${y4} Z`;

  return { path, translateX, translateY };
};

/**
 * Calculate position for icon/text in a sector
 * @param angle - Angle in degrees for the middle of the sector
 * @param radius - Radius to position the icon
 * @returns Object with x and y coordinates
 */
const calculateSectorCenter = (angle: number, radius: number): { x: number; y: number } => {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: radius * Math.cos(rad),
    y: radius * Math.sin(rad),
  };
};

/** Map AreaCard Tag to target site for link patching (cws homepage → workwear/healthcare/hygiene) */
const TAG_TO_SITE: Record<string, string> = {
  workwear: 'workwear',
  hygiene: 'hygiene',
  healthcare: 'healthcare',
  'health and social care': 'healthcare',
  'fire safety': 'hygiene',
  'floor care': 'hygiene',
  cleanrooms: 'hygiene',
};

function getTargetSiteFromTag(tagField: unknown): string | undefined {
  if (!tagField || typeof tagField !== 'object') return undefined;
  const val = (tagField as { value?: string; jsonValue?: { value?: string } }).value
    ?? (tagField as { jsonValue?: { value?: string } }).jsonValue?.value;
  const tag = typeof val === 'string' ? val.toLowerCase().trim() : undefined;
  return tag ? TAG_TO_SITE[tag] : undefined;
}

export const Default: React.FC<AreasComponentProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const locale = useLocale();

  const titleField = fields?.Title;
  const defaultAreaCard = fields?.DefaultAreaCard;
  const areaCards = fields?.AreaCards ?? [];

  // State for active sector - null means no selection
  const [activeSectorIndex, setActiveSectorIndex] = useState<number | null>(null);
  const [hoveredSectorIndex, setHoveredSectorIndex] = useState<number | null>(null);

  // Validation: require title and at least one area card
  if (!titleField || (areaCards.length === 0 && !isPageEditing)) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'AreasComponent'} />;
  }

  const hasCardFields = (card: AreaCardItem | undefined | null): card is AreaCardItem =>
    Boolean(card && typeof card === 'object' && card.fields);

  const getCardLabelField = (card: AreaCardItem | null | undefined) => {
    const tagField = card?.fields?.Tag;
    const tagValue =
      (tagField && typeof tagField === 'object' && 'value' in tagField && (tagField as any).value) ||
      (tagField && typeof tagField === 'object' && 'jsonValue' in tagField && (tagField as any).jsonValue?.value);

    const normalized = typeof tagValue === 'string' ? tagValue.trim() : '';

    // If Tag is empty (your current data), fall back to Title
    if (!normalized) {
      return card?.fields?.Title;
    }

    return card?.fields?.Tag;
  };

  // Calculate sector angles
  const sectors = useMemo(() => {
    const validCards = areaCards.filter((card) => hasCardFields(card) || isPageEditing);
    const numSectors = validCards.length || 5; // Default to 5 if no cards
    const anglePerSector = 360 / numSectors;

    return validCards.map((card, index) => {
      const startAngle = index * anglePerSector;
      const endAngle = (index + 1) * anglePerSector;
      const midAngle = (startAngle + endAngle) / 2;

      return {
        card,
        index,
        startAngle,
        endAngle,
        midAngle,
      };
    });
  }, [areaCards, isPageEditing]);

  // SVG configuration - increased size to accommodate translation effect
  const SECTOR_COLORS = ['#97c9eb', '#f9e244', '#97c9eb', '#ffb447', '#73e0c1', '#b3f2c0'];

  // If DefaultAreaCard is null (your current data), fall back to first AreaCard
  const centerCard: AreaCardItem | null = (defaultAreaCard as AreaCardItem | null) ?? areaCards[0] ?? null;

  // Access center card icon field directly for PageEditor compatibility
  const centerCardIconField = centerCard?.fields?.Icon;
  const centerIconField = getFieldForComponent(centerCardIconField);
  // Safely extract icon src with proper null checking
  const centerIconSrc =
    (centerIconField &&
      typeof centerIconField === 'object' &&
      'value' in centerIconField &&
      centerIconField.value &&
      typeof centerIconField.value === 'object' &&
      'src' in centerIconField.value &&
      centerIconField.value.src) ||
    '';

  const svgSize = 640;
  const centerX = svgSize / 2;
  const centerY = svgSize / 2;
  const outerRadius = 240;
  const innerRadius = 95;
  const iconRadius = (outerRadius + innerRadius) / 2;
  const iconSize = 52;

  // Get active card data - use default card if no sector selected
  const activeCard: AreaCardItem | null =
    activeSectorIndex !== null ? sectors[activeSectorIndex]?.card || null : centerCard;

  // Access fields directly from active card - pass full field objects for PageEditor compatibility
  const activeCardTagField = getCardLabelField(activeCard);
  const activeCardTitleField = activeCard?.fields?.Title;
  const activeCardDescriptionField = activeCard?.fields?.Description;
  const activeCardLinkField = activeCard?.fields?.Link;

  // Check for link value in both jsonValue and direct value formats
  const hasActiveLink = hasLinkHref(activeCardLinkField) || false;

  const activeSectorColor =
    activeSectorIndex !== null ? SECTOR_COLORS[activeSectorIndex % SECTOR_COLORS.length] : null;

  return (
    <section className="mb-4 md:mb-16" data-component="AreasComponent">
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {/* Title */}
        <div className="mb-4 md:mb-8">
          <Text
            tag="h2"
            className="font-heading-2 text-[26px] font-bold text-gray-900 sm:text-[28px] md:text-3xl"
            field={titleField}
          />
        </div>

        {/* Interactive Donut Chart Layout */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:justify-center">
          {/* SVG Donut Chart */}
          <div className="w-full max-w-[640px] md:w-1/2">
            <svg
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              preserveAspectRatio="xMidYMid meet"
              className={cn(
                'h-auto w-full',
                // Security Note: Disable pointer events on SVG container in editing mode to allow
                // foreignObject elements inside to receive clicks for PageEditor editing.
                // This is intentional and safe - foreignObject elements have pointerEvents: 'auto'
                // to explicitly enable interaction, maintaining accessibility and functionality.
                isPageEditing && 'pointer-events-none',
              )}
              role="img"
              aria-label="Interactive areas diagram"
            >
              <g transform={`translate(${centerX},${centerY})`}>
                {activeSectorIndex === null && centerCardIconField && (
                  <>
                    <circle r={innerRadius} fill="#f378c4" stroke="#000000" strokeWidth={6} />
                    <foreignObject
                      x={-20}
                      y={-20}
                      width={40}
                      height={40}
                      style={isPageEditing ? { pointerEvents: 'auto' } : undefined}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <Image
                          field={centerCardIconField as ImageField}
                          className="h-full w-full object-contain"
                          loading="lazy"
                          alt=""
                        />
                      </div>
                    </foreignObject>
                  </>
                )}
                {/* Render each sector */}
                {sectors.map(({ card, index, startAngle, endAngle, midAngle }) => {
                  const isActive = index === activeSectorIndex;
                  const isHovered = index === hoveredSectorIndex;
                  // Access Icon field directly - pass full field object for PageEditor compatibility
                  const iconField = card.fields?.Icon;
                  const hasIconValue = hasImageSource(iconField) || isPageEditing;
                  const sectorColor = SECTOR_COLORS[index % SECTOR_COLORS.length];
                  const { path, translateX, translateY } = createDonutSectorPath(
                    startAngle,
                    endAngle,
                    outerRadius,
                    innerRadius,
                    isActive,
                  );
                  const iconPosition = calculateSectorCenter(midAngle, iconRadius);

                  return (
                    <g
                      key={index}
                      transform={`translate(${translateX}, ${translateY})`}
                      style={{ transition: 'transform 0.3s ease' }}
                    >
                      {/* Sector path */}
                      <path
                        d={path}
                        fill={isActive || isHovered ? sectorColor : '#ffffff'}
                        stroke="#000000"
                        strokeWidth="6"
                        onClick={isPageEditing ? undefined : () => setActiveSectorIndex(index)}
                        onMouseEnter={
                          isPageEditing ? undefined : () => setHoveredSectorIndex(index)
                        }
                        onMouseLeave={isPageEditing ? undefined : () => setHoveredSectorIndex(null)}
                        style={{
                          cursor: isPageEditing ? 'default' : 'pointer',
                          transition: 'fill 0.2s ease',
                          // Enable pointer events in normal mode for click interaction
                          // Disable in editing mode so foreignObject elements can receive clicks
                          pointerEvents: isPageEditing ? 'none' : 'auto',
                        }}
                      />

                      {/* Icon in sector */}
                      {hasIconValue && iconField && (
                        <foreignObject
                          x={iconPosition.x - iconSize / 2}
                          y={iconPosition.y - iconSize / 2}
                          width={iconSize}
                          height={iconSize}
                          style={isPageEditing ? { pointerEvents: 'auto' } : undefined}
                        >
                          <div className="flex h-full w-full items-center justify-center">
                            <Image
                              field={iconField as ImageField}
                              className="h-full w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}

                {/* Center Text - Active Sector Tag */}
                {activeSectorIndex !== null && activeCardTagField && (
                  <foreignObject
                    x={-100}
                    y={-15}
                    width={200}
                    height={30}
                    style={isPageEditing ? { pointerEvents: 'auto' } : undefined}
                  >
                    <div className="flex h-full w-full items-center justify-center text-center">
                      <Text
                        tag="span"
                        field={getFieldForComponent(activeCardTagField) as Field<string>}
                        className="text-[20px] font-bold text-black"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      />
                    </div>
                  </foreignObject>
                )}
              </g>
            </svg>
          </div>

          {/* Content Panel - Right Side */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center">
              {activeCard && (
                <div className="flex h-full flex-col justify-center gap-4">
                  {/* Tag (Category Label) */}
                  {/* Security Note: Text component from Sitecore SDK handles content sanitization internally, preventing XSS */}
                  {(activeCardTagField || isPageEditing) && (
                    <div className="">
                      <Text
                        tag="p"
                        field={getFieldForComponent(activeCardTagField) as Field<string>}
                        className="text-[18px] font-normal text-gray-900 uppercase"
                      />
                    </div>
                  )}

                  {/* Title (Main Heading) */}
                  {/* Security Note: Text component from Sitecore SDK handles content sanitization internally, preventing XSS */}
                  {(activeCardTitleField || isPageEditing) && (
                    <div className="mb-2">
                      <Text
                        tag="h3"
                        field={getFieldForComponent(activeCardTitleField) as Field<string>}
                        className="font-heading-h3 text-[27px] font-bold text-gray-900"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {/* Security Note: RichText component from Sitecore SDK handles content sanitization internally, preventing XSS */}
                  {(activeCardDescriptionField || isPageEditing) && (
                    <div className="text-[18px] leading-relaxed font-normal text-gray-700">
                      <RichText
                        field={getFieldForComponent(activeCardDescriptionField) as RichTextField}
                      />
                    </div>
                  )}

                  {/* CTA Link with Arrow - use card Tag as target site when on cws homepage */}
                  {hasActiveLink && activeCardLinkField && (
                    <div className="group mt-4">
                      <Link
                        field={
                          (patchLinkField(
                            activeCardLinkField as LinkField,
                            siteName,
                            getTargetSiteFromTag(activeCardTagField),
                            locale
                          ) ?? activeCardLinkField) as LinkField
                        }
                        className="group relative inline-flex items-center gap-2 text-gray-900 no-underline"
                      >
                        <ChevronRight
                          className="shrink-0"
                          size={32}
                          strokeWidth={3}
                          aria-hidden="true"
                        />
                        <span className="relative text-[20px] font-bold">
                          {getLinkText(activeCardLinkField) || 'Go to area page'}
                          <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-gray-900 transition-all duration-300 group-hover:w-full"></span>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Default;
