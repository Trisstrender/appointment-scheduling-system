import { ApiResponse, Availability } from '../types';
import axiosInstance from './axiosConfig';

export const availabilityService = {
  getAllAvailabilities: async (): Promise<Availability[]> => {
    const response = await axiosInstance.get<ApiResponse<Availability[]>>('/availabilities');
    return response.data.data;
  },

  getAvailabilityById: async (id: number): Promise<Availability> => {
    const response = await axiosInstance.get<ApiResponse<Availability>>(`/availabilities/${id}`);
    return response.data.data;
  },

  getAvailabilitiesByProviderId: async (providerId: number, recurring?: boolean): Promise<Availability[]> => {
    const response = await axiosInstance.get<ApiResponse<Availability[]>>(`/availabilities/provider/${providerId}`, {
      params: { recurring },
    });
    return response.data.data;
  },

  getAvailabilitiesByProviderIdAndDayOfWeek: async (providerId: number, dayOfWeek: number): Promise<Availability[]> => {
    const response = await axiosInstance.get<ApiResponse<Availability[]>>(
      `/availabilities/provider/${providerId}/day/${dayOfWeek}`
    );
    return response.data.data;
  },

  getAvailabilitiesByProviderIdAndDate: async (providerId: number, date: string): Promise<Availability[]> => {
    const response = await axiosInstance.get<ApiResponse<Availability[]>>(
      `/availabilities/provider/${providerId}/date/${date}`
    );
    return response.data.data;
  },

  createAvailability: async (providerId: number, availabilityData: Partial<Availability>): Promise<Availability> => {
    const response = await axiosInstance.post<ApiResponse<Availability>>(
      `/availabilities/provider/${providerId}`,
      availabilityData
    );
    return response.data.data;
  },

  updateAvailability: async (id: number, availabilityData: Partial<Availability>): Promise<Availability> => {
    const response = await axiosInstance.put<ApiResponse<Availability>>(`/availabilities/${id}`, availabilityData);
    return response.data.data;
  },

  deleteAvailability: async (id: number): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/availabilities/${id}`);
  },

  checkAvailability: async (
    providerId: number,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> => {
    const response = await axiosInstance.get<ApiResponse<boolean>>(`/availabilities/provider/${providerId}/check`, {
      params: { date, startTime, endTime },
    });
    return response.data.data;
  },
};