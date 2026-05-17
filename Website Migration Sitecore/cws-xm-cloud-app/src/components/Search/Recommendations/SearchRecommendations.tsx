import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export type SearchRecommendationsVariant = 'Default' | 'Jobs';

// Field mapping for title field based on variant
const TITLE_FIELD_MAP: Record<SearchRecommendationsVariant, string> = {
    Default: 'name',
    Jobs: 'job_title',
};

export interface SearchRecommendationsProps {
  recommendations: any[];
  initialStateCollapsed?: boolean;
  onSelect: (item: any) => void;
    variant?: SearchRecommendationsVariant;
  searchTerm?: string;
  onClose?: () => void;
}

export const SearchRecommendations: React.FC<SearchRecommendationsProps> = ({
  recommendations,
  initialStateCollapsed = false,
  onSelect,
    variant = 'Default',
  searchTerm = '',
  onClose,
}) => {
  const recommendationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recommendationsRef.current &&
        !recommendationsRef.current.contains(event.target as Node)
      ) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!recommendations || recommendations.length === 0) return null;

  // Helper function to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <strong key={index} className="font-bold">
          {part}
        </strong>
      ) : (
        <span key={index}>{part}</span>
      ),
    );
  };

    const titleField = TITLE_FIELD_MAP[variant];

  return (
    <div
      ref={recommendationsRef}
      className={cn('absolute top-full left-0 z-[9999] w-full', 'border border-[#c5c5c5]')}
      style={{ marginTop: '0', backgroundColor: 'rgb(249, 226, 68)' }}
    >
      <ul className="m-0 list-none p-0">
        {recommendations.map((item, idx) => {
                        const displayTitle = item[titleField] || item.name || item.title || item.id || 'Untitled Result';

          return <li key={item.id || idx} className="p-0 text-[14px]!">
            <button
              onMouseDown={(e) => {
                // Prevent input blur before selection is processed
                e.preventDefault();
                onSelect(item);
              }}
              onClick={() => onSelect(item)}
              className="block w-full cursor-pointer bg-white px-4 py-1 text-left text-[14px] leading-[20px] text-[#333] transition-colors hover:text-[#eb0045] focus:text-[#eb0045] focus:outline-none md:px-5 lg:px-7"
            >
              {highlightMatch(displayTitle, searchTerm)}
            </button>
          </li>
        })}
      </ul>
    </div>
  );
};
