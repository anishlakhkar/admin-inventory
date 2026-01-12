import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090/api';

console.log('[API] Initializing API client with base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    // Skip authentication for /users endpoints (they have @PermitAll on backend)
    // For debugging: You can disable auth by uncommenting the next line
    // const skipAuth = true; // Set to true to disable auth for all requests
    
    // Skip auth for /users endpoints (public endpoints)
    const skipAuth = config.url?.startsWith('/users') || false;
    
    if (!skipAuth) {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log API calls for debugging
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
      hasToken: !skipAuth && !!localStorage.getItem('accessToken'),
      skipAuth,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✅ Success ${response.status} from ${response.config.url}`, {
      dataLength: Array.isArray(response.data) ? response.data.length : 'not an array',
      data: response.data
    });
    return response;
  },
  (error: AxiosError) => {
    const errorDetails = {
      url: error.config?.url,
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      request: error.request,
    };
    
    console.error('[API] ❌ Response error:', errorDetails);
    
    // Log specific error types
    if (error.code === 'ECONNREFUSED') {
      console.error('[API] ❌ Connection Refused - Backend is not running or not accessible');
      console.error('[API] Try: 1. Start the backend server 2. Check if port 9090 is correct');
    } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('[API] ❌ Network Error - Possible CORS issue or network problem');
      console.error('[API] Check: 1. CORS configuration in backend 2. Browser console for CORS errors');
    } else if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error('[API] ❌ Request Timeout - Backend is taking too long to respond');
    } else if (error.response?.status === 0) {
      console.error('[API] ❌ CORS Error - Request blocked by browser');
      console.error('[API] Backend CORS must allow origin:', window.location.origin);
    }
    
    // Only redirect to login for 401 errors on authenticated endpoints (not /users or /auth/login)
    // Don't redirect if we're already on the login page (to allow showing error messages)
    if (
      error.response?.status === 401 && 
      !error.config?.url?.startsWith('/users') &&
      !error.config?.url?.startsWith('/auth/login') &&
      window.location.pathname !== '/login'
    ) {
      console.warn('[API] 401 Unauthorized - Redirecting to login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userTypes');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

