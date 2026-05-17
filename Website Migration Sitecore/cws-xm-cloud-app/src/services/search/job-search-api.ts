
export interface JobDetail {
  job_title?: string;
  job_description?: string;
  job_family?: string;
  job_primary_location?: string;
  job_teaser_text?: string;
  [key: string]: any;
}

/**
 * Fetches job details from Sitecore Search API (server-side).
 * Uses native fetch API for server-side usage.
 */
export async function fetchJobDetailServer(
  jobId: string,
  sourceId?: string
): Promise<JobDetail | null> {
  const searchApiUrl = process.env.SITECORE_SEARCH_API_URL;
  const searchApiKey = process.env.SITECORE_SEARCH_API_KEY;

  if (!searchApiUrl || !searchApiKey) {
    console.error('[search-api] Search API configuration missing');
    return null;
  }

  const normalizedSourceId = sourceId?.trim();

  try {
    const response = await fetch(searchApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': searchApiKey,
      },
      body: JSON.stringify({
        widget: {
          items: [
            {
              rfk_id: 'rfkid_9', // Standard widget ID for jobs
              entity: 'workdayjobs',
              ...(normalizedSourceId ? { sources: [normalizedSourceId] } : {}),
              search: {
                content: {},
                filter: {
                  name: 'id',
                  type: 'eq',
                  value: jobId,
                },
              },
            },
          ],
        },
        context: {
          locale: {
            country: 'us',
            language: 'en',
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data?.widgets?.[0]?.content?.[0] || null;
  } catch (error: any) {
    // Handle fetch errors and network errors
    if (error instanceof Error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network error (e.g., DNS, CORS, connection refused)
        console.error(`[search-api] Network error fetching job ${jobId}:`, {
          message: error.message,
          stack: error.stack
        });
      } else if (error.message.includes('HTTP error! status:')) {
        // HTTP status error (from our response.ok check)
        console.error(`[search-api] HTTP error fetching job ${jobId}:`, {
          status: error.message.replace('HTTP error! status: ', ''),
          message: error.message
        });
      } else {
        // Other errors (JSON parsing, etc.)
        console.error(`[search-api] Error fetching job ${jobId}:`, {
          message: error.message,
          stack: error.stack
        });
      }
    } else {
      // Unknown error type
      console.error(`[search-api] Unexpected error fetching job ${jobId}:`, error);
    }
    return null;
  }
}
