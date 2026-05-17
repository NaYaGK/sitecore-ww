'use client';

import React from 'react';
import { useSitecore, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NewsDetailProps } from './NewsDetail.props';
import { getStringValue } from '@/utils/sitecoreFields';
import { NoDataFallback } from '@/utils/NoDataFallback';

const NewsDetail: React.FC<NewsDetailProps> = ({ fields, className, rendering }) => {
    const { page } = useSitecore();
    const isPageEditing = page?.mode?.isEditing;

    // Access route fields (page level fields)
    const routeFields = page?.layout?.sitecore?.route?.fields as any;

    // Map fields from route or datasource
    // Based on user screenshot, route has 'Date' and 'MetaType'
    const publishDateField = routeFields?.Date;
    const solutionAreaField = routeFields?.SolutionArea;
    const newsTypeField = routeFields?.NewsType;

    const publishDate = getStringValue(publishDateField);
    const solutionArea = getStringValue(solutionAreaField);
    const newsType = getStringValue(newsTypeField) || '';

    // Show placeholder in edit mode if no data found in route or datasource
    const hasData = !!(publishDate || solutionArea);

    if (!hasData && isPageEditing) {
        return <NoDataFallback componentName="NewsDetail" />;
    }

    if (!hasData && !isPageEditing) return null;

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            let ds = dateString;
            // Sitecore ISO date format: 20240210T123456Z or standard ISO
            if (dateString.length === 16 && !dateString.includes('-')) {
                // Convert Sitecore format 20240210T123456Z to ISO
                ds = `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}T${dateString.substring(9, 11)}:${dateString.substring(11, 13)}:${dateString.substring(13, 15)}Z`;
            }

            const date = new Date(ds);
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(date);
        } catch (e) {
            console.warn('Failed to format date:', dateString, e);
            return dateString;
        }
    };

    const formattedDate = formatDate(publishDate || '');

    return (
        <div
            className={cn('news-detail-metadata mx-auto max-w-[1360px] px-4 py-8', className)}
            data-component="NewsDetail"
            id={rendering?.uid}
        >
            <input type="hidden" name="news-type" value={newsType}  />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base">
                    {isPageEditing && publishDateField ? (
                        <Text field={publishDateField} tag="span" className="news-date font-bold text-black" />
                    ) : (
                        formattedDate && <span className="news-date font-bold text-black">{formattedDate}</span>
                    )}

                    {formattedDate && solutionArea && (
                        <span className="hidden h-4 w-px bg-black md:block"></span>
                    )}

                    {isPageEditing && solutionAreaField ? (
                        <Text
                            field={solutionAreaField}
                            tag="span"
                            className="font-bold tracking-wider text-black uppercase"
                        />
                    ) : (
                        solutionArea && (
                            <span className="font-bold tracking-wider text-black uppercase">
                                {solutionArea}
                            </span>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
