// Lightweight placeholder client for Experience Edge GraphQL requests.
// Replace with Content SDK client when wiring XM Cloud.

export async function fetchFromEdge<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const endpoint = process.env.SITECORE_EDGE_URL || 'https://edge.sitecorecloud.io/api/graphql/v1';
  const apiKey = process.env.SITECORE_API_KEY 
  const edgeContextId =process.env.SITECORE_EDGE_CONTEXT_ID ;
  const edgeGqlToken = process.env.SITECORE_EDGE_GQL_TOKEN;
  if (!apiKey && !edgeGqlToken) {
    throw new Error('SITECORE_API_KEY or SITECORE_EDGE_GQL_TOKEN must be set');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (edgeGqlToken) {
    if (edgeContextId) {
      headers.sc_context = edgeContextId;
    }
    headers['X-GQL-Token'] = edgeGqlToken;
  } else if (apiKey) {
    headers.sc_apikey = apiKey;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) throw new Error(`Edge error: ${res.status}`);
  return (await res.json()) as T;
}
