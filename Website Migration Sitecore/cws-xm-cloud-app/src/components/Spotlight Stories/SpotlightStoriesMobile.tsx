'use client';

import { RichText, Image } from '@sitecore-content-sdk/nextjs';
import { SpotlightStoriesProps, StoryItem } from './SpotlightStories.props';
import { useState } from 'react';

export const SpotlightStoriesMobile: React.FC<SpotlightStoriesProps> = (props) => {
  const { fields } = props;

  const sectionTitleField = fields?.Title;
  const stories = fields?.StoriesItem ?? [];
  const backgroundColor = fields?.BackgroundColor?.value || 'var(--color-accent-primary)';

  // First accordion open by default (index 0)
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleAccordion = (index: number) => {
    // If clicking the already open accordion, keep it open (or close it if you prefer)
    // For now, clicking any accordion opens it and closes others
    setOpenIndex(index);
  };

  return (
    <section
      className="block p-4 lg:hidden"
      style={{ backgroundColor }}
      data-component-name="SpotlightStoriesMobile"
    >
      {/* Section Title */}
      {sectionTitleField && (
        <div className="mb-6">
          <h2 className="font-heading-h2 m-0 text-[26px] leading-[33px] font-bold break-words text-[#1a1a1a]">
            <RichText field={sectionTitleField} />
          </h2>
        </div>
      )}

      {/* Accordion Items */}
      <div className="space-y-4">
        {stories.map((story: StoryItem, index: number) => {
          const storyFields = story.fields;
          const titleField = storyFields?.Title;
          const descriptionField = storyFields?.Description;
          const imageField = storyFields?.Image;
          const isOpen = openIndex === index;

          return (
            <div key={story.id || index} className="border-b-2 border-black pb-4">
              {/* Accordion Header */}
              <button
                onClick={() => toggleAccordion(index)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left"
                aria-expanded={isOpen}
              >
                {/* Number and Title */}
                <div className="flex flex-1 items-center gap-3">
                  {/* Circular Number */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-black">
                    <span className="font-heading text-lg font-bold text-[#1a1a1a]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Title */}
                  {titleField && (
                    <h3 className="font-heading-h3 m-0 flex-1 text-[20px] leading-[28px] font-bold text-[#1a1a1a]">
                      <RichText field={titleField} />
                    </h3>
                  )}
                </div>

                {/* Plus/Minus Icon */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {isOpen ? (
                    // Minus Icon
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-black"
                    >
                      <path
                        d="M5 12H19"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    // Plus Icon
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-black"
                    >
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="mt-4 space-y-4">
                  {/* Image */}
                  {imageField?.value?.src && (
                    <div className="align-center flex w-full justify-center overflow-hidden">
                      <Image
                        field={imageField}
                        loading="lazy"
                        alt={imageField?.value?.alt || ''}
                        className="h-[600px] w-[600px] object-cover"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {descriptionField && (
                    <div className="font-body text-[15px] leading-[22px] text-[#333333] [&_p]:mb-3 [&_p:last-child]:mb-0">
                      <RichText field={descriptionField} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SpotlightStoriesMobile;
