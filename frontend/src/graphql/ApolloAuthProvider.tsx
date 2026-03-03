import React, { useMemo } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useAuth } from 'react-oidc-context';

interface ApolloAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Apollo Client provider that automatically attaches the auth token
 * to all GraphQL requests and handles auth errors.
 */
export const ApolloAuthProvider: React.FC<ApolloAuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  const apolloClient = useMemo(() => {
    // HTTP link to the GraphQL endpoint
    const httpLink = new HttpLink({
      uri: import.meta.env.VITE_GRAPHQL_URL || '/graphql',
      credentials: 'include',
    });

    // Auth link that adds the Bearer token to requests
    const authLink = setContext((_, { headers }) => {
      const token = auth.user?.access_token;
      
      return {
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    });

    // Error handling link
    const errorLink = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          // Check for authentication errors
          if (
            err.extensions?.code === 'AUTH_NOT_AUTHENTICATED' ||
            err.extensions?.code === 'AUTH_NOT_AUTHORIZED' ||
            err.message.includes('not authenticated') ||
            err.message.includes('not authorized')
          ) {
            console.warn('GraphQL auth error, triggering re-authentication');
            // Try silent token refresh first
            auth.signinSilent().catch(() => {
              // If silent refresh fails, redirect to login
              auth.signinRedirect();
            });
          }
          console.error(`[GraphQL error]: Message: ${err.message}, Path: ${err.path}`);
        }
      }

      if (networkError) {
        // Check for 401 Unauthorized
        if ('statusCode' in networkError && networkError.statusCode === 401) {
          console.warn('Network 401 error, triggering re-authentication');
          auth.signinSilent().catch(() => {
            auth.signinRedirect();
          });
        }
        console.error(`[Network error]: ${networkError}`);
      }
    });

    // Create Apollo Client with all links
    return new ApolloClient({
      link: from([errorLink, authLink, httpLink]),
      cache: new InMemoryCache({
        typePolicies: {
          Query: {
            fields: {
              personsByTree: {
                merge: false,
              },
              relationshipsByTree: {
                merge: false,
              },
            },
          },
        },
      }),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all',
        },
        query: {
          fetchPolicy: 'network-only',
          errorPolicy: 'all',
        },
        mutate: {
          errorPolicy: 'all',
        },
      },
    });
  }, [auth.user?.access_token, auth]);

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};

export default ApolloAuthProvider;
