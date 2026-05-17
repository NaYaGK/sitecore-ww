import { useEffect, JSX } from 'react';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import sites from '.sitecore/sites.json';
import NotFound from 'src/NotFound';
import Layout from 'src/Layout';
import {
  SitecoreProvider,
  ComponentPropsContext,
  SitecorePageProps,
  StaticPath,
  SiteInfo,
} from '@sitecore-content-sdk/nextjs';
import { extractPath, handleEditorFastRefresh } from '@sitecore-content-sdk/nextjs/utils';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import client from '@/lib/sitecore-client';
import { componentMap as components } from '.sitecore/component-map';
import scConfig from 'sitecore.config';
import { fetchJobDetailServer, JobDetail } from '@/services/search/job-search-api';
import { JobProvider } from '@/contexts/JobContext';
import { fetchGlobalSearchSettingsBySite } from '@/services/search/search-settings.server';

interface JobPageProps extends SitecorePageProps {
  jobDetail?: JobDetail | null;
  jobId?: string;
}

const siteNames = Array.from(new Set(sites.map((site: SiteInfo) => site.name).filter(Boolean))).map(
  (name) => name.toLowerCase(),
);
const DEFAULT_SITE_NAME = (
  process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
  process.env.SITECORE_SITE_NAME ||
  siteNames[0] ||
  'cws'
)
  .trim()
  .toLowerCase();

const WORKWEAR_PATH_SEGMENTS = new Set(
  [
    'workwear',
    'arbeitskleidung',
    'vetements-de-travail',
    'ropa-de-trabajo',
    'abbigliamento-da-lavoro',
    'werkkledij',
    'odziez-robocza-i-ochronna',
    'pracovne-odevy',
    'munka-es-vedoruha',
    'imbracaminte-de-lucru',
    'rabotno-obleklo',
    'radna-odjeca',
    'delovna-oblacila',
    'arbetsklader',
  ].map((segment) => segment.toLowerCase()),
);

const normalizeSiteName = (siteName?: string): string | undefined => {
  if (!siteName) return undefined;
  const key = siteName.toLowerCase();
  if (WORKWEAR_PATH_SEGMENTS.has(key)) return 'workwear';
  return key;
};

const getJobPathSegments = (context: Parameters<GetStaticProps>[0]): string[] => {
  const params = context.params as { path?: string[] | string } | undefined;
  if (!params?.path) return [];
  return Array.isArray(params.path) ? params.path : [params.path];
};

const getRequestedSiteName = (context: Parameters<GetStaticProps>[0]): string | undefined => {
  const params = context.params as { site?: string } | undefined;
  return typeof params?.site === 'string' ? params.site : undefined;
};

const getResolvedSiteName = (
  requestedSiteName?: string,
  normalizedSiteName?: string,
): string => {
  return normalizedSiteName || normalizeSiteName(requestedSiteName) || DEFAULT_SITE_NAME;
};

const getSiteCandidates = (
  requestedSiteName?: string,
  normalizedSiteName?: string,
): string[] => {
  const unique = new Set<string>();
  const candidates: string[] = [];

  if (normalizedSiteName) {
    unique.add(normalizedSiteName);
    candidates.push(normalizedSiteName);
  }

  if (requestedSiteName) {
    const lowerRequested = requestedSiteName.toLowerCase();
    if (!unique.has(lowerRequested)) {
      unique.add(lowerRequested);
      candidates.push(lowerRequested);
    }
  }

  if (!unique.has(DEFAULT_SITE_NAME)) {
    candidates.push(DEFAULT_SITE_NAME);
  }

  return candidates;
};

const SitecorePage = ({ page, notFound, componentProps, jobDetail }: JobPageProps): JSX.Element => {

  useEffect(() => {
    // Since Sitecore Editor does not support Fast Refresh, need to refresh editor chromes after Fast Refresh finished
    handleEditorFastRefresh();
  });

  if (notFound || !page) {
    return <NotFound />;
  }

  return (
    <ComponentPropsContext value={componentProps || {}}>
      <SitecoreProvider componentMap={components} api={scConfig.api} page={page}>
        <Head>
          {jobDetail?.job_family && <meta name="job_family" content={jobDetail.job_family} />}
          {jobDetail?.job_primary_location && (
            <meta name="job_location" content={jobDetail.job_primary_location} />
          )}
        </Head>
        <JobProvider jobDetail={jobDetail || null}>
          <Layout page={page} />
        </JobProvider>
      </SitecoreProvider>
    </ComponentPropsContext>
  );
};

export const getStaticPaths: GetStaticPaths = async (context) => {
  let paths: StaticPath[] = [];
  let fallback: boolean | 'blocking' = 'blocking';

  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    try {
      paths = await client.getPagePaths(
        sites.map((site: SiteInfo) => site.name),
        context?.locales || [],
      );

      paths = paths.map((path) => ({
        ...path,
        params: {
          ...path.params,
          path: Array.isArray(path.params.path)
            ? path.params.path.map((segment) => segment.toLowerCase())
            : path.params.path,
        },
      }));

      // Filter paths to exclude Sitecore internal segments that don't belong in jobs route
      // This prevents "bestsellers" and other product-related items from being matched
      paths = paths.filter((p) => {
        const pArray = Array.isArray(p.params.path) ? p.params.path : [p.params.path];
        return !pArray.some((segment) => segment.includes('_site_'));
      });
    } catch (error) {
      console.error('[jobs] Error fetching static paths:', error);
    }

    fallback = process.env.EXPORT_MODE ? false : fallback;
  }

  return {
    paths,
    fallback,
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let page;
  let jobDetail: JobDetail | null = null;
  const path = extractPath(context);
  const jobPathSegments = getJobPathSegments(context);
  const requestedSiteName = getRequestedSiteName(context);
  const normalizedSiteName = normalizeSiteName(requestedSiteName);
  const resolvedRequestedSiteName = getResolvedSiteName(requestedSiteName, normalizedSiteName);
  const siteCandidates = getSiteCandidates(requestedSiteName, normalizedSiteName);
  const sitecoreJobPath = `/jobs/${jobPathSegments.join('/')}`;
  const pagePath = jobPathSegments.length > 0 ? sitecoreJobPath : path;

  console.log('[jobs:getStaticProps] Site resolution', {
    requestedSiteName,
    normalizedSiteName,
    resolvedRequestedSiteName,
    siteCandidates,
    pagePath,
    locale: context.locale,
  });

  if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
    page = await client.getDesignLibraryData(context.previewData);
  } else {
    if (context.preview) {
      page = await client.getPreview(context.previewData);
    } else {
      for (const siteCandidate of siteCandidates) {
        page = await client.getPage(pagePath, { locale: context.locale, site: siteCandidate });
        if (page) break;
      }
    }

    if (!page && !context.preview) {
      for (const siteCandidate of siteCandidates) {
        page = await client.getPage('/jobs/-w-', { locale: context.locale, site: siteCandidate });
        if (page) break;
      }
    }
  }

  const lastPathSegment = jobPathSegments[jobPathSegments.length - 1] || path?.split('/').filter(Boolean).pop();
  const jobId = lastPathSegment?.split('-').pop();

  const resolvedSiteName =
    page?.siteName ||
    normalizedSiteName ||
    resolvedRequestedSiteName;
  const searchSettings = resolvedSiteName
    ? await fetchGlobalSearchSettingsBySite(resolvedSiteName)
    : undefined;
  const jobSourceId = searchSettings?.job?.sourceId;

  if (page && jobId) {
    try {
      jobDetail = await fetchJobDetailServer(jobId, jobSourceId);


      if (page.layout.sitecore.route?.fields) {
        const fields = page.layout.sitecore.route.fields as any;
        const siteUrl = process.env.NEXT_PUBLIC_RENDERING_HOST_URL?.replace(/\/$/, '') || '';
        const language = context?.locale;
        const cleanPath = requestedSiteName ? `/${requestedSiteName}${sitecoreJobPath}` : sitecoreJobPath;
        const currentUrl = `${siteUrl}/${language}${cleanPath}`;

        // Use normalized path for context to prevent SEO component fallbacks
        if (page.layout.sitecore.context) {
          page.layout.sitecore.context.itemPath = sitecoreJobPath;
        }

        // Populate titles
        if (jobDetail?.job_title) {
          const jobTitle = jobDetail.job_title;
          fields.Title = { value: jobTitle };
          fields.MetaTitle = { value: jobTitle };
          fields.OGTitle = { value: jobTitle };
        }

        // Populate descriptions (strip HTML, clean whitespace, and truncate)
        if (jobDetail?.job_teaser_text) {
          const cleanText = (text: string) =>
            text
              .replace(/<[^>]*>/g, '') // strip HTML
              .replace(/\s+/g, ' ')    // replace all whitespace with single space
              .trim();

          const desc = cleanText(jobDetail.job_teaser_text);

          fields.MetaDescription = { value: desc };
          fields.OGDescription = { value: desc };
        }

        // Set URLs
        fields.OGURL = { value: currentUrl };
        fields.CanonicalURL = { value: currentUrl };


        // Add hidden tracking fields to route
        fields.JobFamily = { value: jobDetail?.job_family ?? null };
        fields.JobLocation = { value: jobDetail?.job_primary_location ?? null };
      }
    } catch (error: any) {
      console.error('[jobs] Error fetching job data for props:', error.message);
    }

    const props: JobPageProps = {
      page,
      dictionary: await client.getDictionary({
        site: page.siteName,
        locale: page.locale,
      }),
      componentProps: await client.getComponentData(page.layout, context, components),
      jobDetail,
    };

    return {
      props,
      revalidate: 5,
    };
  }

  return {
    props: {
      page: page || null,
      notFound: !page,
    },
    revalidate: 5,
    notFound: !page,
  };
};

export default SitecorePage;
