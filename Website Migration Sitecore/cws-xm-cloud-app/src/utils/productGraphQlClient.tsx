import { GraphQLRequestClient } from '@sitecore-content-sdk/nextjs/client';
import scConfig from 'sitecore.config';

export const getProductGraphQlClient = (): GraphQLRequestClient => {
  const edgeGqlToken = getEdgeGqlToken();
  const endpoint = scConfig.api.edge.edgeUrl;
  if (!endpoint) {
    throw new Error('SITECORE_EDGE_URL is not configured');
  }

  const headers: Record<string, string> = {
    'X-GQL-Token': edgeGqlToken,
  };

  const contextId = scConfig.api.edge.contextId;
  if (contextId) {
    headers.sc_context = contextId;
  }

  return new GraphQLRequestClient(endpoint, {
    apiKey: '',
    headers,
  });
};

export const getEdgeGqlToken = (): string => {
  const gqlToken = process.env.SITECORE_EDGE_GQL_TOKEN;
  if (!gqlToken) {
    throw new Error('SITECORE_EDGE_GQL_TOKEN is not configured');
  }

  return gqlToken;
};
