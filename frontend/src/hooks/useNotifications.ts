import { useDispatch, useSelector } from 'react-redux';
import { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearAll,
  Notification
} from '../store/slices/notificationSlice';
import { RootState } from '../store';

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export const useNotifications = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNewNotification = (notification: NotificationData) => {
    dispatch(addNotification(notification));
  };

  const markNotificationAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const markAllNotificationsAsRead = () => {
    dispatch(markAllAsRead());
  };

  const removeNotificationById = (id: string) => {
    dispatch(removeNotification(id));
  };

  const clearAllNotifications = () => {
    dispatch(clearAll());
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