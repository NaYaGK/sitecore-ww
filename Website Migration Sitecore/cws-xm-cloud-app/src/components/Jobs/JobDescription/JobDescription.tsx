'use client';

import React from 'react';
import { useOptionalJobContext } from '@/contexts/JobContext';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { JobDescriptionProps } from './JobDescription.props';
import { cn } from '@/lib/utils';

export const JobDescription: React.FC<JobDescriptionProps> = ({ params }) => {
    const jobContext = useOptionalJobContext();
    const jobDetail = jobContext?.jobDetail;

    const description = jobDetail?.job_description || '';
    const postingDate = jobDetail?.posted_at || jobDetail?.job_start_date || '';
    const applyUrl = jobDetail?.job_url || '#';

    const { page } = useSitecore();
    const isPageEditing = page?.mode?.isEditing;

    // If no context/data, show placeholder for editors
    if (isPageEditing) {
        return (
            <section className=" max-w-[1360px] mx-auto w-full bg-white py-4 text-center font-bold text-gray-500 border-2 border-dashed border-gray-300">
                [ Job Description - No Data Found ]
            </section>
        );
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            // Normalize: Extract YYYY-MM-DD from strings like "2025-07-17-07:00" or ISO strings
            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
            if (dateMatch) {
                const [year, month, day] = (dateMatch[1] ?? '').split('-');
                return `${day}.${month}.${year}`;
            }

            // Fallback for numeric timestamps or other formats
            const numericDate = Number(dateStr);
            const date = !isNaN(numericDate) ? new Date(numericDate) : new Date(dateStr);

            if (isNaN(date.getTime())) {
                return dateStr;
            }

            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <section className={cn("max-w-[1360px] mx-auto bg-white py-12", params?.Styles)} data-component="JobDescription">
            <div className=" px-2 md:px-4">
                <div className="">
                    {postingDate && (
                        <div className="mb-8 lg:mb-12 text-lg lg:text-xl font-bold text-black">
                            {formatDate(postingDate)}
                        </div>
                    )}

                    <div
                        className="prose prose-lg max-w-[1360px] text-black mb-12
                            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-8
                            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-8
                            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-6
                            [&_p]:mb-4 [&_p]:leading-relaxed
                            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:ml-5 [&_ul]:mb-6
                            [&_ul_p]:m-0
                            [&_li]:m-0 [&_li]:leading-snug
                            [&_b]:font-bold [&_strong]:font-bold"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    {jobDetail && (
                        <div className="mt-10 lg:mt-12 ">
                            <a
                                href={applyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block md:inline-flex rounded-2xl border-2 border-black py-[9px] px-[60px] text-lg md:text-xl font-bold text-black transition-all hover:bg-black hover:text-white w-full lg:w-auto justify-center text-center"
                            >
                                Apply now
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default JobDescription;
