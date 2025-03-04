import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: string;
  userType: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
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

// User service methods
export const userService = {
  // Get current user profile
  getCurrentUser: () => {
    return api.get<{ success: boolean; data: User }>('/users/me');
  },
  
  // Get user by ID
  getUserById: (userId: number) => {
    return api.get<{ success: boolean; data: User }>(`/users/${userId}`);
  },
  
  // Update user profile
  updateUser: (userId: number, userData: Partial<User>) => {
    return api.put<{ success: boolean; data: User }>(`/users/${userId}`, userData);
  },
  
  // Get all users (admin only)
  getAllUsers: () => {
    return api.get<{ success: boolean; data: User[] }>('/users');
  },
  
  // Get all clients
  getAllClients: () => {
    return api.get<{ success: boolean; data: User[] }>('/users/clients');
  },
  
  // Get all providers
  getAllProviders: () => {
    return api.get<{ success: boolean; data: User[] }>('/users/providers');
  },
  
  // Activate user (admin only)
  activateUser: (userId: number) => {
    return api.put<{ success: boolean; message: string }>(`/users/${userId}/activate`);
  },
  
  // Deactivate user (admin only)
  deactivateUser: (userId: number) => {
    return api.put<{ success: boolean; message: string }>(`/users/${userId}/deactivate`);
  },
  
  // Delete user (admin only)
  deleteUser: (userId: number) => {
    return api.delete<{ success: boolean; message: string }>(`/users/${userId}`);
  },
};