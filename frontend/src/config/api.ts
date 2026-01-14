// API configuration for development and production
// @ts-ignore - Vite provides import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get the full API URL
 * In development: uses proxy from vite.config.ts
 * In production: uses VITE_API_URL env variable or relative path
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // If API_BASE_URL is set, use it
  if (API_BASE_URL) {
    return `${API_BASE_URL}/${cleanEndpoint}`;
  }
  
  // Otherwise use relative path (works with Vercel rewrites)
  return `/api/${cleanEndpoint}`;
};

/**
 * Make an API request
 */
export const apiRequest = (endpoint: string): string => {
  return getApiUrl(endpoint);
};

