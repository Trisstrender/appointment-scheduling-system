import { ApiResponse, User } from '../types';
import axiosInstance from './axiosConfig';

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/users/me');
    return response.data.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  },

  getAllClients: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/users/clients');
    return response.data.data;
  },

  getAllProviders: async (): Promise<User[]> => {
    const response = await axiosInstance.get<ApiResponse<User[]>>('/users/providers');
    return response.data.data;
  },

  updateUser: async (id: number, userData: Partial<User>): Promise<User> => {
    const response = await axiosInstance.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await axiosInstance.delete<ApiResponse<void>>(`/users/${id}`);
  },
};