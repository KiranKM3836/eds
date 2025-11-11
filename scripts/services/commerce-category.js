import { getConfigValue, getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { categoryQuery } from './graphql.js';

// Cache for category data to avoid redundant requests
let categoryCache = null;
let categoryCachePromise = null;

/**
 * Creates a short hash from an object by sorting its entries and hashing them.
 * @param {Object} obj - The object to hash
 * @param {number} [length=5] - Length of the resulting hash
 * @returns {string} A short hash string
 */
function createHashFromObject(obj, length = 5) {
  // Sort entries by key and create a string of key-value pairs
  const objString = Object.entries(obj)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  // Create a short hash using a simple string manipulation
  return objString
    .split('')
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 2147483647, 0)
    .toString(36)
    .slice(0, length);
}

/**
 * Creates a commerce endpoint URL with query parameters including a cache-busting hash.
 * @returns {Promise<URL>} A promise that resolves to the endpoint URL with query parameters
 */
export async function commerceEndpointWithQueryParams() {
  const urlWithQueryParams = new URL(getConfigValue('commerce-endpoint'));
  const headers = getHeaders('cs');
  const shortHash = createHashFromObject(headers);
  urlWithQueryParams.searchParams.append('cb', shortHash);
  return urlWithQueryParams;
}

/**
 * Performs a Catalog Service GraphQL query
 * @param {string} query - The GraphQL query string
 * @param {Object} [variables] - Optional query variables
 * @returns {Promise<Object|null>} Promise that resolves to full query response or null on error
 */
export async function performCatalogServiceQuery(query, variables) {
  const headers = {
    ...(getHeaders('cs')),
    'Content-Type': 'application/json',
  };

  const apiCall = await commerceEndpointWithQueryParams();
  apiCall.searchParams.append('query', query.replace(/(?:\r\n|\r|\n|\t|[\s]{4})/g, ' ')
    .replace(/\s\s+/g, ' '));
  apiCall.searchParams.append('variables', variables ? JSON.stringify(variables) : null);

  const response = await fetch(apiCall, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const queryResponse = await response.json();

  return queryResponse;
}

/**
 * Fetches categories from Adobe Commerce GraphQL endpoint
 * Implements caching and request deduplication for performance
 * @returns {Promise<Object>} Promise that resolves to category data
 */
export async function fetchCategories() {
  // Return cached data if available
  if (categoryCache) {
    return categoryCache;
  }

  // Return existing promise if request is in flight (deduplication)
  if (categoryCachePromise) {
    return categoryCachePromise;
  }

  // Create new fetch request using the Catalog Service query pattern
  categoryCachePromise = (async () => {
    try {
      const result = await performCatalogServiceQuery(categoryQuery, null);

      if (!result) {
        throw new Error('Failed to fetch categories from GraphQL endpoint');
      }

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error('GraphQL query failed');
      }

      // Cache the successful result (result.data contains the actual category data)
      categoryCache = result.data || result;
      return categoryCache;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Clear promise on error so retry is possible
      categoryCachePromise = null;
      throw error;
    } finally {
      // Clear promise after completion (success or error)
      categoryCachePromise = null;
    }
  })();

  return categoryCachePromise;
}

/**
 * Clears the category cache (useful for testing or forced refresh)
 */
export function clearCategoryCache() {
  categoryCache = null;
  categoryCachePromise = null;
}

