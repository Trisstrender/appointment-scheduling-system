import axios from './axiosConfig';
import { Notification } from '../store/slices/notificationSlice';

interface GetNotificationsResponse {
  notifications: Notification[];
  totalCount: number;
}

interface NotificationResponse {
  success: boolean;
  message: string;
  notification?: Notification;
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (page = 0, size = 10): Promise<GetNotificationsResponse> => {
  try {
    const response = await axios.get(`/notifications?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<NotificationResponse> => {
  try {
    const response = await axios.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.delete('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}; 