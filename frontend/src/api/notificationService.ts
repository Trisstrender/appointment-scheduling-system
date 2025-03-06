import axios from './axiosConfig';

export interface NotificationDTO {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<NotificationDTO[]> => {
  try {
    const response = await axios.get('/api/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get paginated notifications for the current user
 */
export const getPaginatedNotifications = async (page = 0, size = 10): Promise<{
  content: NotificationDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}> => {
  try {
    const response = await axios.get(`/api/notifications/paginated?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated notifications:', error);
    throw error;
  }
};

/**
 * Get unread notifications for the current user
 */
export const getUnreadNotifications = async (): Promise<NotificationDTO[]> => {
  try {
    const response = await axios.get('/api/notifications/unread');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
};

/**
 * Get the count of unread notifications for the current user
 */
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await axios.get('/api/notifications/unread/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param notificationId The ID of the notification to mark as read
 * @returns The updated notification
 */
export const markNotificationAsRead = async (notificationId: string): Promise<NotificationDTO> => {
  try {
    const response = await axios.put(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await axios.put('/api/notifications/read-all');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await axios.delete(`/api/notifications/${notificationId}`);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<void> => {
  try {
    await axios.delete('/api/notifications');
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}; 