import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types
export interface Appointment {
  id: number;
  clientId: number;
  clientName?: string;
  providerId: number;
  providerName?: string;
  serviceId: number;
  serviceName?: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
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

// Appointment service methods
export const appointmentService = {
  // Get all appointments (admin only)
  getAllAppointments: () => {
    return api.get<{ success: boolean; data: Appointment[] }>('/appointments');
  },
  
  // Get appointment by ID
  getAppointmentById: (appointmentId: number) => {
    return api.get<{ success: boolean; data: Appointment }>(`/appointments/${appointmentId}`);
  },
  
  // Get appointments by client ID
  getAppointmentsByClientId: (clientId: number) => {
    return api.get<{ success: boolean; data: Appointment[] }>(`/appointments/client/${clientId}`);
  },
  
  // Get appointments by provider ID
  getAppointmentsByProviderId: (providerId: number) => {
    return api.get<{ success: boolean; data: Appointment[] }>(`/appointments/provider/${providerId}`);
  },
  
  // Create appointment
  createAppointment: (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    return api.post<{ success: boolean; data: Appointment }>('/appointments', appointmentData);
  },
  
  // Update appointment
  updateAppointment: (appointmentId: number, appointmentData: Partial<Appointment>) => {
    return api.put<{ success: boolean; data: Appointment }>(`/appointments/${appointmentId}`, appointmentData);
  },
  
  // Update appointment status
  updateAppointmentStatus: (appointmentId: number, status: string) => {
    return api.put<{ success: boolean; data: Appointment }>(`/appointments/${appointmentId}/status/${status}`);
  },
  
  // Cancel appointment
  cancelAppointment: (appointmentId: number) => {
    return api.put<{ success: boolean; data: Appointment }>(`/appointments/${appointmentId}/cancel`);
  },
  
  // Delete appointment (admin only)
  deleteAppointment: (appointmentId: number) => {
    return api.delete<{ success: boolean; message: string }>(`/appointments/${appointmentId}`);
  },
};