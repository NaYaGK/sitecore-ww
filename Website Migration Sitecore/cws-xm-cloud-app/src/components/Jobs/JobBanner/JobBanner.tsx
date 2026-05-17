'use client';

import React from 'react';
import { useOptionalJobContext } from '@/contexts/JobContext';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { JobBannerProps } from './JobBanner.props';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

export const JobBanner: React.FC<JobBannerProps> = ({ fields, params }) => {
  const jobContext = useOptionalJobContext();
  const jobDetail = jobContext?.jobDetail;

  const title = fields?.Title?.value || jobDetail?.job_title || '';

  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  // If no context/data, show placeholder for editors
  if (isPageEditing) {
    return (
      <section className="mx-auto max-w-[1360px] border-2 border-dashed border-gray-400 bg-[#FFED00] py-4 text-center font-bold text-gray-800">
        [ Job Banner - No Data Found ]
      </section>
    );
  }

  return (
    <section
      className=""
      data-component="JobBanner"
    >
        < div className={cn(
        'bg-(--color-accent-primary) px-2 [-webkit-font-smoothing:antialiased] lg:px-4 px-2 py-12 lg:py-[90px] lg:pb-[140px]',
        params?.Styles,
      )}>
      <div className="mx-auto max-w-[1360px] px-1 md:px-0">
        <h1 className="font-heading-h1">{title}</h1>
      </div>

      </div>
       <nav className="mx-auto max-w-[1360px] px-1 md:px-4 my-4 md:mt-10" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <a href="/" className="flex items-center">
              <img
                src="/assets/icons/home.svg"
                alt="Home"
                width={20}
                height={20}
                className="block lg:hidden"
              />
              <span className="hidden lg:inline">Home</span>
            </a>
          </li>
          <li className="flex items-center space-x-2">
            <ChevronRight strokeWidth={2} size={16} className="font-bold" />
            <span className="font-bold">{title}</span>
          </li>
        </ol>
      </nav>
    </section>
  );
};

export default JobBanner;
export const Default = JobBanner;
