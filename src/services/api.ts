import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error?: {
    message: string;
    code?: string;
  };
  success: boolean;
}

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // Add auth token if exists
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        // Handle unauthorized
        console.error('Unauthorized access - please login again');
      } else if (status === 404) {
        console.error('The requested resource was not found');
      } else if (status >= 500) {
        console.error('Server error occurred');
      }
      
      return Promise.reject({
        message: data?.message || 'An error occurred',
        code: status,
        response: error.response
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'No response from server. Please check your connection.',
        code: 'NO_RESPONSE'
      });
    } else {
      // Something happened in setting up the request
      return Promise.reject({
        message: error.message || 'An error occurred',
        code: 'REQUEST_ERROR'
      });
    }
  }
);

// API methods
export const contactApi = {
  /**
   * Submit contact form data to the server
   * @param data Contact form data
   * @returns Promise with success status and message
   */
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(
        '/contact',
        data
      );

      if (!response.data) {
        throw new Error('No response data received');
      }

      return response.data.data!;
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      throw new Error(error.message || 'Failed to submit contact form');
    }
  },
};

export default api;
