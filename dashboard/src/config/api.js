/**
 * LifeLink Twin - API Configuration
 * 
 * Handles API URL for both development and production
 */

// Determine the API base URL based on environment
const getApiUrl = () => {
    // In production (Vercel), use relative paths - the API is on the same domain
    if (import.meta.env.PROD) {
        return '';  // Empty string for relative URLs
    }
    // In development, use localhost
    return 'http://localhost:3000';
};

export const API_BASE_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...defaultOptions, ...options });
    return response;
};

export default API_BASE_URL;
