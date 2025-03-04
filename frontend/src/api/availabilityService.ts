import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types
export interface Availability {
  id: number;
  providerId: number;
  providerName?: string;
  recurring: boolean;
  dayOfWeek?: number;
  specificDate?: string;
  startTime: string;
  endTime: string;
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

// Availability service methods
export const availabilityService = {
  // Get all availabilities (admin only)
  getAllAvailabilities: () => {
    return api.get<{ success: boolean; data: Availability[] }>('/availabilities');
  },
  
  // Get availability by ID
  getAvailabilityById: (availabilityId: number) => {
    return api.get<{ success: boolean; data: Availability }>(`/availabilities/${availabilityId}`);
  },
  
  // Get availabilities by provider ID
  getAvailabilitiesByProviderId: (providerId: number) => {
    return api.get<{ success: boolean; data: Availability[] }>(`/availabilities/provider/${providerId}`);
  },
  
  // Get recurring availabilities by provider ID
  getRecurringAvailabilitiesByProviderId: (providerId: number) => {
    return api.get<{ success: boolean; data: Availability[] }>(`/availabilities/provider/${providerId}/recurring`);
  },
  
  // Get specific date availabilities by provider ID
  getSpecificDateAvailabilitiesByProviderId: (providerId: number, date: string) => {
    return api.get<{ success: boolean; data: Availability[] }>(`/availabilities/provider/${providerId}/date/${date}`);
  },
  
  // Create availability (provider only)
  createAvailability: (providerId: number, availabilityData: Omit<Availability, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>) => {
    return api.post<{ success: boolean; data: Availability }>(`/availabilities/provider/${providerId}`, availabilityData);
  },
  
  // Update availability
  updateAvailability: (availabilityId: number, availabilityData: Partial<Availability>) => {
    return api.put<{ success: boolean; data: Availability }>(`/availabilities/${availabilityId}`, availabilityData);
  },
  
  // Delete availability
  deleteAvailability: (availabilityId: number) => {
    return api.delete<{ success: boolean; message: string }>(`/availabilities/${availabilityId}`);
  },
};