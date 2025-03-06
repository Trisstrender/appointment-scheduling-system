import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useNotifications } from '../useNotifications';
import notificationReducer from '../../store/slices/notificationSlice';

// Create a wrapper component with Redux Provider
const createWrapper = () => {
  const store = configureStore({
    reducer: {
      notifications: notificationReducer,
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe('useNotifications', () => {
  it('should return initial state', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should add a notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TEST_TYPE',
        title: 'Test Title',
        message: 'Test Message',
      });
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].type).toBe('TEST_TYPE');
    expect(result.current.notifications[0].title).toBe('Test Title');
    expect(result.current.notifications[0].message).toBe('Test Message');
    expect(result.current.notifications[0].read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it('should mark a notification as read', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TEST_TYPE',
        title: 'Test Title',
        message: 'Test Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markNotificationAsRead(notificationId);
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should mark all notifications as read', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TEST_TYPE_1',
        title: 'Test Title 1',
        message: 'Test Message 1',
      });
      result.current.addNewNotification({
        type: 'TEST_TYPE_2',
        title: 'Test Title 2',
        message: 'Test Message 2',
      });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAllNotificationsAsRead();
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.notifications[1].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should remove a notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TEST_TYPE',
        title: 'Test Title',
        message: 'Test Message',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.removeNotificationById(notificationId);
    });

    expect(result.current.notifications.length).toBe(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TEST_TYPE_1',
        title: 'Test Title 1',
        message: 'Test Message 1',
      });
      result.current.addNewNotification({
        type: 'TEST_TYPE_2',
        title: 'Test Title 2',
        message: 'Test Message 2',
      });
    });

    expect(result.current.notifications.length).toBe(2);

    act(() => {
      result.current.clearAllNotifications();
    });

    expect(result.current.notifications.length).toBe(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('should get notifications by type', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TYPE_A',
        title: 'Title A',
        message: 'Message A',
      });
      result.current.addNewNotification({
        type: 'TYPE_B',
        title: 'Title B',
        message: 'Message B',
      });
      result.current.addNewNotification({
        type: 'TYPE_A',
        title: 'Title A2',
        message: 'Message A2',
      });
    });

    const typeANotifications = result.current.getNotificationsByType('TYPE_A');
    expect(typeANotifications.length).toBe(2);
    expect(typeANotifications[0].title).toBe('Title A');
    expect(typeANotifications[1].title).toBe('Title A2');

    const typeBNotifications = result.current.getNotificationsByType('TYPE_B');
    expect(typeBNotifications.length).toBe(1);
    expect(typeBNotifications[0].title).toBe('Title B');
  });

  it('should get unread notifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TYPE_A',
        title: 'Title A',
        message: 'Message A',
      });
      result.current.addNewNotification({
        type: 'TYPE_B',
        title: 'Title B',
        message: 'Message B',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markNotificationAsRead(notificationId);
    });

    const unreadNotifications = result.current.getUnreadNotifications();
    expect(unreadNotifications.length).toBe(1);
    expect(unreadNotifications[0].title).toBe('Title B');
  });

  it('should get read notifications', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewNotification({
        type: 'TYPE_A',
        title: 'Title A',
        message: 'Message A',
      });
      result.current.addNewNotification({
        type: 'TYPE_B',
        title: 'Title B',
        message: 'Message B',
      });
    });

    const notificationId = result.current.notifications[0].id;

    act(() => {
      result.current.markNotificationAsRead(notificationId);
    });

    const readNotifications = result.current.getReadNotifications();
    expect(readNotifications.length).toBe(1);
    expect(readNotifications[0].title).toBe('Title A');
  });

  it('should add appointment confirmation notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addAppointmentConfirmation('123', 'Swedish Massage', new Date().toISOString());
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].type).toBe('APPOINTMENT_CONFIRMED');
    expect(result.current.notifications[0].title).toBe('Appointment Confirmed');
    expect(result.current.notifications[0].data?.appointmentId).toBe('123');
    expect(result.current.notifications[0].data?.serviceName).toBe('Swedish Massage');
  });

  it('should add appointment cancellation notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addAppointmentCancellation('123', 'Swedish Massage', new Date().toISOString());
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].type).toBe('APPOINTMENT_CANCELLED');
    expect(result.current.notifications[0].title).toBe('Appointment Cancelled');
    expect(result.current.notifications[0].data?.appointmentId).toBe('123');
    expect(result.current.notifications[0].data?.serviceName).toBe('Swedish Massage');
  });

  it('should add appointment reminder notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addAppointmentReminder('123', 'Swedish Massage', new Date().toISOString());
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].type).toBe('APPOINTMENT_REMINDER');
    expect(result.current.notifications[0].title).toBe('Upcoming Appointment');
    expect(result.current.notifications[0].data?.appointmentId).toBe('123');
    expect(result.current.notifications[0].data?.serviceName).toBe('Swedish Massage');
  });

  it('should add new appointment notification', () => {
    const { result } = renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.addNewAppointmentNotification('123', 'John Doe', 'Swedish Massage', new Date().toISOString());
    });

    expect(result.current.notifications.length).toBe(1);
    expect(result.current.notifications[0].type).toBe('NEW_APPOINTMENT');
    expect(result.current.notifications[0].title).toBe('New Appointment');
    expect(result.current.notifications[0].data?.appointmentId).toBe('123');
    expect(result.current.notifications[0].data?.clientName).toBe('John Doe');
    expect(result.current.notifications[0].data?.serviceName).toBe('Swedish Massage');
  });
}); 