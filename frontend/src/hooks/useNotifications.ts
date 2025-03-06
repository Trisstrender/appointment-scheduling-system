import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearAll,
  setNotifications,
  Notification
} from '../store/slices/notificationSlice';
import { RootState } from '../store';
import * as notificationApi from '../api/notificationService';

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.notifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Fetch notifications from the API
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.getNotifications();
      // Convert backend DTOs to frontend notification format
      const formattedNotifications = data.map(dto => ({
        id: dto.id.toString(),
        type: dto.type,
        title: dto.title,
        message: dto.message,
        read: dto.read,
        createdAt: dto.createdAt,
        data: dto.data
      }));
      dispatch(setNotifications(formattedNotifications));
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Fetch unread notification count from the API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationApi.getUnreadNotificationCount();
      return count;
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
      return 0;
    }
  }, []);

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const addNewNotification = (notification: NotificationData) => {
    dispatch(addNotification(notification));
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      await notificationApi.markNotificationAsRead(Number(id));
      dispatch(markAsRead(id));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationApi.markAllNotificationsAsRead();
      dispatch(markAllAsRead());
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const removeNotificationById = async (id: string) => {
    try {
      await notificationApi.deleteNotification(Number(id));
      dispatch(removeNotification(id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationApi.deleteAllNotifications();
      dispatch(clearAll());
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    }
  };

  const getNotificationsByType = (type: string): Notification[] => {
    return notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = (): Notification[] => {
    return notifications.filter(notification => !notification.read);
  };

  const getReadNotifications = (): Notification[] => {
    return notifications.filter(notification => notification.read);
  };

  // Helper functions for common notification types
  const addAppointmentConfirmation = (appointmentId: string, serviceName: string, dateTime: string) => {
    addNewNotification({
      type: 'APPOINTMENT_CONFIRMED',
      title: 'Appointment Confirmed',
      message: `Your appointment for ${serviceName} on ${new Date(dateTime).toLocaleDateString()} at ${new Date(dateTime).toLocaleTimeString()} has been confirmed.`,
      data: {
        appointmentId,
        serviceName,
        dateTime
      }
    });
  };

  const addAppointmentCancellation = (appointmentId: string, serviceName: string, dateTime: string) => {
    addNewNotification({
      type: 'APPOINTMENT_CANCELLED',
      title: 'Appointment Cancelled',
      message: `Your appointment for ${serviceName} on ${new Date(dateTime).toLocaleDateString()} has been cancelled.`,
      data: {
        appointmentId,
        serviceName,
        dateTime
      }
    });
  };

  const addAppointmentReminder = (appointmentId: string, serviceName: string, dateTime: string) => {
    addNewNotification({
      type: 'APPOINTMENT_REMINDER',
      title: 'Upcoming Appointment',
      message: `Reminder: You have an appointment for ${serviceName} on ${new Date(dateTime).toLocaleDateString()} at ${new Date(dateTime).toLocaleTimeString()}.`,
      data: {
        appointmentId,
        serviceName,
        dateTime
      }
    });
  };

  const addNewAppointmentNotification = (appointmentId: string, clientName: string, serviceName: string, dateTime: string) => {
    addNewNotification({
      type: 'NEW_APPOINTMENT',
      title: 'New Appointment',
      message: `${clientName} has booked an appointment for ${serviceName} on ${new Date(dateTime).toLocaleDateString()} at ${new Date(dateTime).toLocaleTimeString()}.`,
      data: {
        appointmentId,
        clientName,
        serviceName,
        dateTime
      }
    });
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    addNewNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotificationById,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications,
    getReadNotifications,
    addAppointmentConfirmation,
    addAppointmentCancellation,
    addAppointmentReminder,
    addNewAppointmentNotification
  };
}; 