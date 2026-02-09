// Centralized API configuration
// This file manages the base URL for all API calls
// In production, set VITE_API_BASE_URL environment variable in Vercel

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.vasha.in';

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}/${cleanEndpoint}`;
};
