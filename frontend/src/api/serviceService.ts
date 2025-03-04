import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types
export interface Service {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  providerId: number;
  providerName?: string;
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

// Service service methods
export const serviceService = {
  // Get all services
  getAllServices: (activeOnly: boolean = false) => {
    return api.get<{ success: boolean; data: Service[] }>(`/services?activeOnly=${activeOnly}`);
  },
  
  // Get service by ID
  getServiceById: (serviceId: number) => {
    return api.get<{ success: boolean; data: Service }>(`/services/${serviceId}`);
  },
  
  // Get services by provider ID
  getServicesByProviderId: (providerId: number, activeOnly: boolean = false) => {
    return api.get<{ success: boolean; data: Service[] }>(`/services/provider/${providerId}?activeOnly=${activeOnly}`);
  },
  
  // Create service (provider only)
  createService: (providerId: number, serviceData: Omit<Service, 'id' | 'providerId' | 'createdAt' | 'updatedAt'>) => {
    return api.post<{ success: boolean; data: Service }>(`/services/provider/${providerId}`, serviceData);
  },
  
  // Update service
  updateService: (serviceId: number, serviceData: Partial<Service>) => {
    return api.put<{ success: boolean; data: Service }>(`/services/${serviceId}`, serviceData);
  },
  
  // Delete service
  deleteService: (serviceId: number) => {
    return api.delete<{ success: boolean; message: string }>(`/services/${serviceId}`);
  },
  
  // Activate service
  activateService: (serviceId: number) => {
    return api.put<{ success: boolean; data: Service }>(`/services/${serviceId}/activate`);
  },
  
  // Deactivate service
  deactivateService: (serviceId: number) => {
    return api.put<{ success: boolean; data: Service }>(`/services/${serviceId}/deactivate`);
  },
};