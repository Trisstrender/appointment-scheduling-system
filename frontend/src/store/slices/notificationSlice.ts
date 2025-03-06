import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

interface NotificationState {
  notifications: Notification[];
}

const initialState: NotificationState = {
  notifications: []
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read' | 'createdAt'>>) => {
      state.notifications.unshift({
        id: uuidv4(),
        read: false,
        createdAt: new Date().toISOString(),
        ...action.payload
      });
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    clearAll: (state) => {
      state.notifications = [];
    },
    // For testing and demo purposes
    loadDemoNotifications: (state) => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      state.notifications = [
        {
          id: uuidv4(),
          type: 'APPOINTMENT_CONFIRMED',
          title: 'Appointment Confirmed',
          message: 'Your appointment for Swedish Massage on Friday at 2:00 PM has been confirmed.',
          read: false,
          createdAt: now.toISOString(),
          data: {
            appointmentId: '123',
            serviceName: 'Swedish Massage',
            dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: uuidv4(),
          type: 'APPOINTMENT_REMINDER',
          title: 'Upcoming Appointment',
          message: 'Reminder: You have an appointment for Deep Tissue Massage tomorrow at 10:00 AM.',
          read: false,
          createdAt: oneHourAgo.toISOString(),
          data: {
            appointmentId: '456',
            serviceName: 'Deep Tissue Massage',
            dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: uuidv4(),
          type: 'APPOINTMENT_CANCELLED',
          title: 'Appointment Cancelled',
          message: 'Your appointment for Hair Styling on Monday has been cancelled.',
          read: true,
          createdAt: threeDaysAgo.toISOString(),
          data: {
            appointmentId: '789',
            serviceName: 'Hair Styling',
            dateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ];
    }
  }
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearAll,
  loadDemoNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer; 