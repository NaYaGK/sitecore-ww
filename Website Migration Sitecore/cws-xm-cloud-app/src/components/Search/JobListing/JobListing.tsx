'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { fetchJobResults } from '@/services/search/search.service';
import { JobListingProps } from './JobListing.props';
import { getStringValue } from '@/utils/sitecoreFields';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { ChevronRight } from 'lucide-react';
import { patchHref } from '@/lib/patch-link';
import { resolveJobCountryCodesForLocale } from '@/services/search/job-country-code';

interface Job {
    id: string;
    job_title: string;
    job_description: string;
    job_city: string;
    job_country: string;
    job_family: string;
    job_start_date: string;
    job_url: string;
    updated_at?: string;
    job_primary_location?: string;
    job_division?: string;
    [key: string]: any;
}

const JobListing: React.FC<JobListingProps> = ({ fields, className }) => {
    const { page } = useSitecore();
    const siteName = useSiteName();
    const pageSiteName =
        (page as { siteName?: string; context?: { site?: { name?: string } } } | undefined)?.siteName ||
        (page as { context?: { site?: { name?: string } } } | undefined)?.context?.site?.name;
    const hasResolvedSite = Boolean(pageSiteName);
    const isPageEditing = page?.mode?.isEditing;

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const latestRequestIdRef = useRef(0);

    // Extract locale and country code
    const { locale, countryCode, jobCountryCodes } = useMemo(() => {
        const rawLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en-US';
        const [languagePart = 'en', countryPart = 'us'] = rawLanguage.split('-');
        const resolvedJobCountryCodes = resolveJobCountryCodesForLocale(languagePart, countryPart);

        return {
            locale: {
                language: languagePart.toUpperCase(),
                country: countryPart,
            },
            countryCode: resolvedJobCountryCodes[0] || countryPart.toUpperCase(),
            jobCountryCodes: resolvedJobCountryCodes,
        };
    }, [page?.layout?.sitecore?.route?.itemLanguage]);

    const globalSearchSettings = useGlobalSearchSettings(siteName);

    const { widgetId, entityName, sourceId } = resolveSearchSettings({
        globalSettings: globalSearchSettings,
        defaults: { widgetId: 'rfkid_9', entityName: 'workdayjobs' },
        isJobSearch: true,
    });
    const effectiveSourceId = sourceId;
    const rawResultCount = getStringValue(fields?.ResultCount);
    const resultCount = rawResultCount ? parseInt(rawResultCount, 10) : 100;

    useEffect(() => {
        const requestId = ++latestRequestIdRef.current;
        let cancelled = false;

        const shouldFetch = Boolean(locale && countryCode && hasResolvedSite && effectiveSourceId);

        if (!shouldFetch) {
            setJobs([]);
            setLoading(false);
            return;
        }

        const loadJobs = async () => {
            setLoading(true);
            try {
                const { results } = await fetchJobResults(
                    widgetId,
                    jobCountryCodes,
                    resultCount,
                    entityName,
                    effectiveSourceId,
                );
                if (cancelled || requestId !== latestRequestIdRef.current) return;
                setJobs(results as Job[]);
            } catch (error) {
                if (cancelled || requestId !== latestRequestIdRef.current) return;
                console.error('Failed to load jobs:', error);
            } finally {
                if (cancelled || requestId !== latestRequestIdRef.current) return;
                setLoading(false);
            }
        };

        const checkSdk = () => {
            if (typeof window !== 'undefined' && window.scCloudSDK) {
                loadJobs();
            }
        };

        if (document.readyState === 'complete') {
            checkSdk();
        } else {
            window.addEventListener('load', checkSdk);
        }

        return () => {
            cancelled = true;
            window.removeEventListener('load', checkSdk);
        };
    }, [widgetId, locale, countryCode, jobCountryCodes, resultCount, entityName, effectiveSourceId, hasResolvedSite]);

    // Group jobs by job_family
    const groupedJobs = useMemo(() => {
        const groups: Record<string, Job[]> = {};

        jobs.forEach((job) => {
            const family = job.job_family || 'Other';
            if (!groups[family]) {
                groups[family] = [];
            }
            groups[family].push(job);
        });

        // Sort by date descending
        const getDateVal = (d?: string) => {
            if (!d) return 0;
            const datePart = d.substring(0, 10);
            return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? new Date(datePart).getTime() : 0;
        };

        Object.keys(groups).forEach((key) => {
            groups[key]?.sort((a, b) => {
                const dateA = getDateVal(a.job_start_date);
                const dateB = getDateVal(b.job_start_date);
                return dateB - dateA;
            });
        });

        return groups;
    }, [jobs]);

    // Date formatter (display only)
    const formatJobDate = (dateString: string | undefined): string => {
        if (!dateString) return '';
        try {
            const datePart = dateString.substring(0, 10);
            if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return '';

            const date = new Date(datePart);
            return date.toLocaleDateString(`${locale.language}-${countryCode}`, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return '';
        }
    };

    if (!fields && !isPageEditing) return <NoDataFallback componentName="JobListing" />;

    // Generate URL: jobs/slugified-title-id
    const generateJobUrl = (job: Job) => {
        const itemLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en';


        if (!job.job_title) return '#';

        const slug = job.job_title
            .toLowerCase()
            .replace(/&/g, 'and') // Replace & with 'and'
            .replace(/\//g, '-')   // Replace / with -
            .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
            .replace(/^-+|-+$/g, ''); // Trim dashes

        // Use id or fallback to a hash
        const id = job.id || '';
        const fallbackUrl = `/${itemLanguage}/jobs/${slug}-${id}`;
        return patchHref(fallbackUrl, siteName, undefined, itemLanguage) || fallbackUrl;
    };

    const noJobsText = getStringValue(fields?.NoResultText);
    return (
        <div className={cn('max-w-[1360px] mx-auto px-6 lg:px-4 mb-8 lg:mb-10', className)} data-component="JobListing">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <p className="text-xl font-medium text-gray-500">Loading jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="py-20 text-center">
                    <p className="text-xl font-medium text-gray-500">{noJobsText}</p>
                </div>
            ) : (
                <div className="flex flex-col ">
                    {Object.entries(groupedJobs).map(([family, familyJobs]) => (
                        <div key={family} className="flex flex-col">
                            {/* Group Header - matches CWS h3 style */}
                            <h3 className="font-heading-h3 font-bold text-black mx-0 mt-12 mb-6 lg:mb-8lg:mt-18">
                                {family}
                            </h3>

                            {/* Jobs in Group */}
                            <div className="flex flex-col gap-0">
                                {familyJobs.map((job, index) => {
                                    const jobLocation = job.job_primary_location || job.job_city || '';
                                    const jobDate = formatJobDate(job.job_start_date || job.updated_at);
                                    const isLastItem = index === familyJobs.length - 1;

                                    return (
                                        <a
                                            key={job.id || index}
                                            href={generateJobUrl(job)}
                                            className={`px-4 lg:px-0 group block py-4 transition-colors hover:bg-(--color-accent-primary) cursor-pointer ${index === 0 ? 'border-t-2  border-black' : 'border-t-2 border-black'
                                                } ${isLastItem ? 'border-b-2 border-black' : ''}`}
                                        >
                                            {/* Location and Date - matches CWS metadata style */}
                                            <div className="mb-1 text-[14px] ml-6 lg:ml-7 leading-normal">
                                                {[jobLocation, jobDate].filter(Boolean).join(' | ')}
                                            </div>

                                            {/* Job Title - matches CWS link style */}
                                            <div className="flex items-start lg:items-center  mb-2 gap-2 text-[16px] font-normal leading-normal text-black ">
                                                <ChevronRight className="min-h-5 min-w-5 " />
                                                <div className='text-[17px] lg:text-[28px] leading-[18px] lg:leading-[32px]'>
                                                    {job.job_division && (
                                                        <span className="font-bold">{job.job_division} - </span>
                                                    )}
                                                    {job.job_title}
                                                </div>
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobListing;
