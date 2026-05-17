'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { FindYourJobProps } from './FindYourJob.props';
import { fetchFindYourJobResults } from '@/services/search/find-your-job.service';
import { getStringValue } from '@/utils/sitecoreFields';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { patchHref } from '@/lib/patch-link';
import { resolveJobCountryCodesForLocale } from '@/services/search/job-country-code';

type JobItem = {
  id: string;
  job_title?: string;
  job_description?: string;
  job_teaser_text?: string;
  job_division?: string;
  job_solution_area?: string | string[];
  job_employee_type?: string;
  job_family?: string;
  job_city?: string;
  job_primary_location?: string;
  job_start_date?: string;
  updated_at?: string;
  employment_type?: string;
  job_employment_type?: string;
  job_type?: string;
  url?: string;
  [key: string]: any;
};

const formatDate = (dateString: string | undefined, locale: string): string => {
  if (!dateString) return '';
  const datePart = dateString.substring(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return '';
  const [, month, day] = datePart.split('-');
  const year = datePart.substring(0, 4);
  return `${day}.${month}.${year}`;
};

const getDateValue = (dateString: string | undefined): number => {
  if (!dateString) return 0;
  const datePart = dateString.substring(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) ? new Date(datePart).getTime() : 0;
};

const getJobSortDateValue = (job: JobItem): number => getDateValue(job.job_start_date || job.updated_at);

const normalize = (value: string | undefined): string =>
  (value || '').trim().toLowerCase().replace(/[\s_-]+/g, '');

const normalizeJobValues = (...values: unknown[]): string[] =>
  values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => (typeof value === 'string' ? normalize(value) : ''))
    .filter(Boolean);

const fallbackCardBackgrounds = [
  'bg-[#f378c4]',
  'bg-[#97c9eb]',
  'bg-[#73e0c1]',
  'bg-[#ffb447]',
] as const;

const JOB_ICONS = {
  calendar: '/assets/icons/jobs/calendar.svg',
  time: '/assets/icons/jobs/time.svg',
  location: '/assets/icons/jobs/location.svg',
  divisionHealthcare: '/assets/icons/jobs/division-healthcare.svg',
  divisionHygiene: '/assets/icons/jobs/division-hygiene.svg',
  divisionWorkwear: '/assets/icons/jobs/division-workwear.svg',
  divisionCleanrooms: '/assets/icons/jobs/division-cleanrooms.svg',
  divisionFiresafety: '/assets/icons/jobs/division-firesafety.svg',
} as const;

const pickDeterministicBackground = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 2147483647;
  }
  const picked = fallbackCardBackgrounds[hash % fallbackCardBackgrounds.length];
  return picked ?? 'bg-[#f378c4]';
};

const getCardBackgroundByJob = (job: JobItem): string => {
  const normalizedAreas = normalizeJobValues(
    job.job_division,
    job.job_solution_area,
    job.solution_area,
    job.job_family,
  );

  if (normalizedAreas.some((value) => value.includes('corporate'))) {
    return 'bg-[#f378c4]';
  }
  if (normalizedAreas.some((value) => value.includes('workwear'))) {
    return 'bg-[#f9e244]';
  }
  if (normalizedAreas.some((value) => value.includes('hygiene'))) return 'bg-[#97c9eb]';
  if (normalizedAreas.some((value) => value.includes('healthcare'))) return 'bg-[#acd800]';
  if (normalizedAreas.some((value) => value.includes('cleanroom'))) return 'bg-[#73e0c1]';
  if (
    normalizedAreas.some(
      (value) => value.includes('firesafety') || value.includes('firesafe'),
    )
  ) {
    return 'bg-[#ffb447]';
  }

  const seed = job.job_division || job.job_family || job.job_country_code || job.id || '';
  return pickDeterministicBackground(seed);
};

const getDivisionIconByJob = (job: JobItem): string => {
  const normalizedDivision = normalize(job.job_division);
  const normalizedArea = normalize(job.job_division || job.job_family);

  if (normalizedDivision.includes('workwear') || normalizedArea.includes('workwear')) {
    return JOB_ICONS.divisionWorkwear;
  }
  if (normalizedDivision.includes('hygiene') || normalizedArea.includes('hygiene')) {
    return JOB_ICONS.divisionHygiene;
  }
  if (normalizedDivision.includes('healthcare') || normalizedArea.includes('healthcare')) {
    return JOB_ICONS.divisionHealthcare;
  }
  if (
    normalizedDivision.includes('cleanroom') ||
    normalizedDivision.includes('cleanrooms') ||
    normalizedArea.includes('cleanroom') ||
    normalizedArea.includes('cleanrooms')
  ) {
    return JOB_ICONS.divisionCleanrooms;
  }
  if (
    normalizedDivision.includes('firesafety') ||
    normalizedDivision.includes('firesafe') ||
    normalizedArea.includes('firesafety') ||
    normalizedArea.includes('firesafe')
  ) {
    return JOB_ICONS.divisionFiresafety;
  }

  return JOB_ICONS.divisionWorkwear;
};

const stripHtmlTags = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const estimateJobCardHeight = (job: JobItem): number => {
  const titleLength = (job.job_title || '').length;
  const descriptionSource = job.job_teaser_text || job.job_description || '';
  const descriptionLength = stripHtmlTags(descriptionSource).length;

  // Approximate visual height so cards can be placed in the currently shorter column.
  return 220 + titleLength * 0.55 + descriptionLength * 0.11;
};

type FacetValue = {
  text?: string;
  value?: string;
};

type Facet = {
  name?: string;
  value?: FacetValue[];
};

const FindYourJob: React.FC<FindYourJobProps> = ({ fields, className }) => {
  const { page } = useSitecore();
  const siteName = useSiteName();
  const isPageEditing = page?.mode?.isEditing;

  const title = getStringValue(fields?.Title) || 'Find your job at CWS!';
  const positionLabel = getStringValue(fields?.PlaceholderText) || 'Position';
  const regionLabel = getStringValue(fields?.RegionText) || 'Region/City';
  const solutionAreaLabel = getStringValue(fields?.SolutionAreaText) || 'Solution area';
  const employmentTypeLabel = getStringValue(fields?.EmploymentTypeText) || 'Employment type';
  const filterButtonText = getStringValue(fields?.FilterButtonText) || 'Filter';
  const jobCardCtaText = getStringValue(fields?.CtaText) || 'Jetzt mehr erfahren';

  const itemLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en-US';
  const globalSearchSettings = useGlobalSearchSettings(siteName);

  const { sourceId, widgetId, entityName } = resolveSearchSettings({
    globalSettings: globalSearchSettings,
    defaults: { widgetId: 'rfkid_9', entityName: 'workdayjobs' },
    isJobSearch: true,
  });
  const resultCount = parseInt(getStringValue(fields?.ResultCount) || '100', 10);

  const [languagePart = 'en', countryPart = 'US'] = itemLanguage.split('-');
  const displayLocale = `${languagePart}-${countryPart.toUpperCase()}`;
  const currentLanguage = itemLanguage;
  const jobCountryCodes = useMemo(
    () => resolveJobCountryCodesForLocale(languagePart, countryPart),
    [languagePart, countryPart],
  );
  const countryCode = jobCountryCodes[0] || countryPart.toUpperCase();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [region, setRegion] = useState('all');
  const [solutionArea, setSolutionArea] = useState('all');
  const [employmentType, setEmploymentType] = useState('all');
  const [regions, setRegions] = useState<string[]>([]);
  const [solutionAreas, setSolutionAreas] = useState<string[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [pendingScrollAfterLoad, setPendingScrollAfterLoad] = useState(false);
  const latestRequestIdRef = useRef(0);
  const [appliedFilters, setAppliedFilters] = useState({
    keyword: '',
    region: 'all',
    solutionArea: 'all',
    employmentType: 'all',
  });

  const locale = useMemo(
    () => ({ language: languagePart.toUpperCase(), country: countryPart.toUpperCase() }),
    [languagePart, countryPart],
  );

  const extractFacetValues = (facets: Facet[], facetName: string): string[] => {
    const facet = facets.find((item) => item?.name === facetName);
    const values = (facet?.value || [])
      .map((item) => item.text || item.value || '')
      .filter(Boolean) as string[];
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  };

  const loadJobs = async (filters: typeof appliedFilters, page: number = 1) => {
    const requestId = ++latestRequestIdRef.current;
    setLoading(true);
    try {
      const selectedFacets: Record<string, string[]> = {};
      if (filters.region !== 'all') selectedFacets.job_primary_location = [filters.region];
      if (filters.solutionArea !== 'all') selectedFacets.job_division = [filters.solutionArea];
      if (filters.employmentType !== 'all') {
        selectedFacets.job_employee_type = [filters.employmentType];
      }

      const offset = (page - 1) * resultCount;

      const response = await fetchFindYourJobResults(
        filters.keyword,
        widgetId,
        entityName,
        locale,
        resultCount,
        offset,
        selectedFacets,
        jobCountryCodes,
        sourceId,
      );

      if (requestId !== latestRequestIdRef.current) return;
      const sortedJobs = [...((response.results || []) as JobItem[])].sort((a, b) => {
        return getJobSortDateValue(b) - getJobSortDateValue(a);
      });

      setJobs(sortedJobs);
      setTotalResults(response.total || 0);
      setCurrentPage(page);
      const facets = (response.facets || []) as Facet[];
      setSolutionAreas(extractFacetValues(facets, 'job_division'));
      setEmploymentTypes(extractFacetValues(facets, 'job_employee_type'));
      setRegions(extractFacetValues(facets, 'job_primary_location'));
    } catch (error) {
      if (requestId !== latestRequestIdRef.current) return;
      console.error('Failed to load jobs for FindYourJob:', error);
      setJobs([]);
      setTotalResults(0);
      setCurrentPage(1);
      setSolutionAreas([]);
      setEmploymentTypes([]);
      setRegions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    const checkSdk = () => {
      if (typeof window !== 'undefined' && (window as any).scCloudSDK) {
        loadJobs(appliedFilters);
      }
    };

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      checkSdk();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', checkSdk);
      return () => window.removeEventListener('load', checkSdk);
    }
  }, [widgetId, resultCount, entityName, sourceId, locale, countryCode, jobCountryCodes]);

  useEffect(() => {
    if (!loading && pendingScrollAfterLoad) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      resultsRef.current?.focus({ preventScroll: true });
      setPendingScrollAfterLoad(false);
    }
  }, [loading, pendingScrollAfterLoad]);

  const getJobUrl = (job: JobItem): string => {
    if (job.url) {
      return patchHref(job.url, siteName, undefined, currentLanguage) || job.url;
    }
    if (!job.job_title || !job.id) return '#';
    const slug = job.job_title
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/\//g, '-')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const fallbackUrl = `/${itemLanguage}/jobs/${slug}-${job.id}`;
    return patchHref(fallbackUrl, siteName, undefined, currentLanguage) || fallbackUrl;
  };

  const applyFilters = () => {
    const nextFilters = { keyword: keyword.trim(), region, solutionArea, employmentType };
    setAppliedFilters(nextFilters);
    loadJobs(nextFilters, 1);
  };

  const applyFiltersOnFacetChange = (nextValues: Partial<typeof appliedFilters>) => {
    const nextFilters = {
      keyword: keyword.trim(),
      region,
      solutionArea,
      employmentType,
      ...nextValues,
    };
    setAppliedFilters(nextFilters);
    loadJobs(nextFilters, 1);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const totalPages = totalResults > 0 ? Math.ceil(totalResults / resultCount) : 0;
  const shouldShowPagination = jobs.length > 0 && totalResults > resultCount && totalPages > 1;

  const visiblePages = useMemo(() => {
    if (totalPages === 0) return [];
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 2) return [1, 2, 3];
    if (currentPage >= totalPages - 1) return [totalPages - 2, totalPages - 1, totalPages];

    return [currentPage - 1, currentPage, currentPage + 1];
  }, [currentPage, totalPages]);

  const handlePageChange = (page: number) => {
    if (loading || page < 1 || page > totalPages || page === currentPage) return;

    setPendingScrollAfterLoad(true);
    loadJobs(appliedFilters, page);
  };

  const renderJobCard = (job: JobItem, index: number, spacingClass: string) => {
    const description = job.job_teaser_text || job.job_description || '';
    const jobDate = formatDate(job.job_start_date || job.updated_at, displayLocale);
    const location = job.job_primary_location || '';
    const employment = job.job_employee_type || job.job_employment_type || '';
    const area = job.job_division || '';
    const jobUrl = getJobUrl(job);
    const cardBg = getCardBackgroundByJob(job);
    const divisionIcon = getDivisionIconByJob(job);

    return (
      <div
        key={job.id || `${index}`}
        className={cn('block w-full p-6 text-black no-underline', spacingClass, cardBg)}
      >
        <h3 className="font-heading-h3 mb-[5px]! whitespace-normal break-words uppercase">
          <a href={jobUrl} className="inline-block text-inherit no-underline hover:no-underline">
            <span className="inline pb-[2px] [background-image:linear-gradient(currentColor,currentColor)] [background-position:0_100%] [background-repeat:no-repeat] [background-size:0_2px] transition-[background-size] duration-300 ease-out hover:[background-size:100%_2px]">
              {job.job_title}
            </span>
          </a>
        </h3>
        {description && (
          <div
            className="mb-4 text-[17px] leading-[28px]"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        <div className="mb-3 text-[17px] lg:text-[18px] font-medium">Ref.-Nr.: {job.id}</div>
        <div className="mb-4 grid grid-cols-2 gap-2 pt-4 text-[17px] leading-[28px] ">
          <div className="flex items-center gap-2">
            <img src={JOB_ICONS.calendar} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
            <span>{jobDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={JOB_ICONS.time} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
            <span>{employment}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={JOB_ICONS.location} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={divisionIcon} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
            <span>{area}</span>
          </div>
        </div>
        <div className="mx-auto inline-flex w-full items-center justify-center">
          <a
            href={jobUrl}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border-2 border-black px-12 py-3 font-bold text-black no-underline transition-colors hover:bg-black hover:text-white"
          >
            {jobCardCtaText}
          </a>
        </div>
      </div>
    );
  };

  const { leftColumnJobs, rightColumnJobs } = useMemo(() => {
    const left: JobItem[] = [];
    const right: JobItem[] = [];
    let leftHeight = 0;
    let rightHeight = 0;

    jobs.forEach((job) => {
      const cardHeight = estimateJobCardHeight(job);
      if (leftHeight <= rightHeight) {
        left.push(job);
        leftHeight += cardHeight;
      } else {
        right.push(job);
        rightHeight += cardHeight;
      }
    });

    return { leftColumnJobs: left, rightColumnJobs: right };
  }, [jobs]);

  if (!fields && !isPageEditing) return <NoDataFallback componentName="FindYourJob" />;

  return (
    <section className={cn('component relative ', className)} data-component="FindYourJob">
      <div className="bg-(--color-accent-primary)">
        <div className="mx-auto max-w-[1360px] pr-[55px] pt-[30px] pb-[25px] pl-[55px] lg:pt-10 lg:pb-12">
          <h2 className="font-heading-h2 mb-6!">{title}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-12">
            <div className="md:col-span-4 md:col-start-1">
              <div className="relative border-b-2 border-black">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={positionLabel}
                  className="w-full bg-transparent py-2 pr-12 text-[18px] font-regular leading-none text-black placeholder:text-[18px] placeholder:text-black outline-none"
                />
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="pointer-events-none absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 text-black"
                >
                  <path
                    d="M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm8 2-4.2-4.2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            <div className="relative md:col-span-4">
              <label className="sr-only">
                {regionLabel}
              </label>
              <select
                value={region}
                onChange={(e) => {
                  const nextRegion = e.target.value;
                  setRegion(nextRegion);
                  applyFiltersOnFacetChange({ region: nextRegion });
                }}
                className="w-full appearance-none font-bold bg-transparent py-2 pr-12 text-black  text-[18px] outline-none"
              >
                <option value="all">{regionLabel}</option>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 text-black"
              >
                <path
                  d="m6 9 6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative md:col-span-4 md:col-start-1">
              <label className="sr-only">
                {solutionAreaLabel}
              </label>
              <select
                value={solutionArea}
                onChange={(e) => {
                  const nextSolutionArea = e.target.value;
                  setSolutionArea(nextSolutionArea);
                  applyFiltersOnFacetChange({ solutionArea: nextSolutionArea });
                }}
                className="w-full appearance-none font-bold bg-transparent py-2 pr-12 text-black  text-[18px] outline-none"
              >
                <option value="all">{solutionAreaLabel}</option>
                {solutionAreas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 text-black"
              >
                <path
                  d="m6 9 6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative md:col-span-4">
              <label className="sr-only">
                {employmentTypeLabel}
              </label>
              <select
                value={employmentType}
                onChange={(e) => {
                  const nextEmploymentType = e.target.value;
                  setEmploymentType(nextEmploymentType);
                  applyFiltersOnFacetChange({ employmentType: nextEmploymentType });
                }}
                className="w-full appearance-none font-bold bg-transparent py-2 pr-12 text-black  text-[18px] outline-none"
              >
                <option value="all">{employmentTypeLabel}</option>
                {employmentTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute right-0 top-1/2 h-9 w-9 -translate-y-1/2 text-black"
              >
                <path
                  d="m6 9 6 6 6-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="md:col-span-4 w-full md:mr-6 md:self-end">
              <button
                type="submit"
                className="w-full cursor-pointer rounded-[20px] border-2 border-black bg-transparent px-[40px] py-[9px] text-center font-bold text-[16px] leading-[24px] text-black transition-all duration-100 hover:bg-black hover:text-white lg:px-[50px] lg:text-[18px] lg:leading-[26px]"
              >
                {filterButtonText}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div ref={resultsRef} tabIndex={-1} className="mx-auto max-w-[1360px] px-4 py-10">
        {jobs.length === 0 ? (
          !loading ? (
            <div className="py-20 text-center text-gray-600">No jobs found.</div>
          ) : null
        ) : (
          <>
            <div className="mx-auto grid grid-cols-1 gap-6 md:hidden">
              {jobs.map((job, index) => renderJobCard(job, index, ''))}
            </div>

            <div className="mx-auto hidden md:grid md:grid-cols-2 md:gap-14">
              <div className="flex flex-col gap-14">
                {leftColumnJobs.map((job, index) => renderJobCard(job, index, ''))}
              </div>
              <div className="flex flex-col gap-14">
                {rightColumnJobs.map((job, index) => renderJobCard(job, index, ''))}
              </div>
            </div>
          </>
        )}

        {shouldShowPagination && (
          <div className="mt-8 flex items-center justify-center gap-5">
            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={loading}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
                  <path
                    d="M14.5 6.5L9 12l5.5 5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {currentPage > 2 && (
              <span className="text-4xl font-extrabold leading-none text-black md:text-5xl">...</span>
            )}

            {visiblePages.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page)}
                disabled={loading}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={cn(
                  'min-w-8 text-[40px]  leading-[28px] disabled:cursor-not-allowed disabled:opacity-60 font-medium',
                  page === currentPage ? 'text-[#f378c4]' : 'text-black',
                )}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 1 && (
              <span className="text-[40px] font-medium leading-none text-black ">...</span>
            )}

            {currentPage < totalPages && (
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={loading}
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black text-black disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7">
                  <path
                    d="M9.5 6.5L15 12l-5.5 5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-sm bg-black/90 shadow-lg backdrop-blur-sm">
            <img
              src="/assets/icons/search-loader.svg"
              alt="Loading"
              className="h-8 w-8 animate-[spin_4.5s_linear_infinite]"
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default FindYourJob;
