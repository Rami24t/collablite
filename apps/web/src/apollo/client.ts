import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)

    // Check for CORS errors
    if (networkError.message.includes('CORS') || networkError.message.includes('cross-origin')) {
      console.error('CORS Error: Make sure backend CORS is configured to allow localhost:5173')
    }
  }
})

// HTTP link
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? 'https://collablite-backend.onrender.com/graphql' : 'http://localhost:4044/graphql'),
  credentials: 'include',
  fetchOptions: {
    timeout: 60000, // 60 second timeout for cold starts
  },
});

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          merge(existing = [], incoming) {
            return incoming
          },
        },
        projects: {
          merge(existing = [], incoming) {
            return incoming
          },
        },
        tasks: {
          merge(existing = [], incoming) {
            return incoming
          },
        },
      },
    },
  },
})

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache,
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
})