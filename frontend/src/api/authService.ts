import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  userType: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userType: string;
  };
  message?: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth service methods
export const authService = {
  // Login user
  login: (credentials: LoginRequest) => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },
  
  // Register user
  register: (userData: RegisterRequest) => {
    return api.post<AuthResponse>('/auth/register', userData);
  },
  
  // Verify token
  verifyToken: () => {
    return api.get<AuthResponse>('/auth/verify');
  },
};