import { ApiResponse, Appointment } from '../types';
import axiosInstance from './axiosConfig';

export const appointmentService = {
  getAllAppointments: async (): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>('/appointments');
    return response.data.data;
  },

  getAppointmentById: async (id: number): Promise<Appointment> => {
    const response = await axiosInstance.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data;
  },

  getAppointmentsByClientId: async (clientId: number, upcoming?: boolean): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(`/appointments/client/${clientId}`, {
      params: { upcoming },
    });
    return response.data.data;
  },

  getAppointmentsByProviderId: async (providerId: number, upcoming?: boolean): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(`/appointments/provider/${providerId}`, {
      params: { upcoming },
    });
    return response.data.data;
  },

  getAppointmentsByServiceId: async (serviceId: number): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(`/appointments/service/${serviceId}`);
    return response.data.data;
  },

  getAppointmentsByStatus: async (status: string): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(`/appointments/status/${status}`);
    return response.data.data;
  },

  getAppointmentsByProviderIdAndDate: async (providerId: number, date: string): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
      `/appointments/provider/${providerId}/date/${date}`
    );
    return response.data.data;
  },

  getAppointmentsByClientIdAndDate: async (clientId: number, date: string): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
      `/appointments/client/${clientId}/date/${date}`
    );
    return response.data.data;
  },

  getAppointmentsByProviderIdAndDateRange: async (
    providerId: number,
    startDateTime: string,
    endDateTime: string
  ): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(
      `/appointments/provider/${providerId}/range`,
      {
        params: { startDateTime, endDateTime },
      }
    );
    return response.data.data;
  },

  getAppointmentsByClientIdAndDateRange: async (
    clientId: number,
    startDateTime: string,
    endDateTime: string
  ): Promise<Appointment[]> => {
    const response = await axiosInstance.get<ApiResponse<Appointment[]>>(`/appointments/client/${clientId}/range`, {
      params: { startDateTime, endDateTime },
    });
    return response.data.data;
  },

  createAppointment: async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await axiosInstance.post<ApiResponse<Appointment>>('/appointments', appointmentData);
    return response.data.data;
  },

  updateAppointment: async (id: number, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await axiosInstance.put<ApiResponse<Appointment>>(`/appointments/${id}`, appointmentData);
    return response.data.data;
  },

  updateAppointmentStatus: async (id: number, status: string): Promise<Appointment> => {
    const response = await axiosInstance.put<ApiResponse<Appointment>>(`/appointments/${id}/status/${status}`);
    return response.data.data;
  },

  deleteAppointment: async (id: number): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/appointments/${id}`);
  },

  checkAvailability: async (
    providerId: number,
    startDateTime: string,
    endDateTime: string
  ): Promise<boolean> => {
    const response = await axiosInstance.get<ApiResponse<boolean>>('/appointments/check', {
      params: { providerId, startDateTime, endDateTime },
    });
    return response.data.data;
  },
};