import { ApiResponse, Service } from '../types';
import axiosInstance from './axiosConfig';

export const serviceService = {
  getAllServices: async (activeOnly?: boolean): Promise<Service[]> => {
    const response = await axiosInstance.get<ApiResponse<Service[]>>('/services', {
      params: { activeOnly },
    });
    return response.data.data;
  },

  getServiceById: async (id: number): Promise<Service> => {
    const response = await axiosInstance.get<ApiResponse<Service>>(`/services/${id}`);
    return response.data.data;
  },

  getServicesByProviderId: async (providerId: number, activeOnly?: boolean): Promise<Service[]> => {
    const response = await axiosInstance.get<ApiResponse<Service[]>>(`/services/provider/${providerId}`, {
      params: { activeOnly },
    });
    return response.data.data;
  },

  createService: async (providerId: number, serviceData: Partial<Service>): Promise<Service> => {
    const response = await axiosInstance.post<ApiResponse<Service>>(`/services/provider/${providerId}`, serviceData);
    return response.data.data;
  },

  updateService: async (id: number, serviceData: Partial<Service>): Promise<Service> => {
    const response = await axiosInstance.put<ApiResponse<Service>>(`/services/${id}`, serviceData);
    return response.data.data;
  },

  deleteService: async (id: number): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/services/${id}`);
  },

  activateService: async (id: number): Promise<void> => {
    await axiosInstance.put<ApiResponse<void>>(`/services/${id}/activate`);
  },

  deactivateService: async (id: number): Promise<void> => {
    await axiosInstance.put<ApiResponse<void>>(`/services/${id}/deactivate`);
  },
};