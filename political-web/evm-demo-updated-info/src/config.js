// Base URL Configuration
// Always uses current domain - works on any hosting (localhost, evm-demo.in, or any other domain)

// Check if running in development mode
export const isDevelopment = () => {
    const hostname = window.location.hostname;
    return hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.includes('.local');
};

// Get the base URL - ALWAYS uses current domain
// This ensures correct URLs whether hosted on:
// - localhost:5173
// - evm-demo.in
// - any-other-domain.com
export const getBaseUrl = () => {
    return window.location.origin;
};

// Alias for backward compatibility
export const getCurrentBaseUrl = () => {
    return window.location.origin;
};
