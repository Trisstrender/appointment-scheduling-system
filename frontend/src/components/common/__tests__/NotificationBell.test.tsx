import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import NotificationBell from '../NotificationBell';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);

describe('NotificationBell Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      notifications: {
        notifications: [
          {
            id: '1',
            type: 'APPOINTMENT_CONFIRMED',
            title: 'Appointment Confirmed',
            message: 'Your appointment has been confirmed',
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'APPOINTMENT_REMINDER',
            title: 'Appointment Reminder',
            message: 'You have an appointment tomorrow',
            read: true,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    store.dispatch = jest.fn();
  });

  it('renders the notification bell with correct badge count', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationBell />
        </BrowserRouter>
      </Provider>
    );

    // Check if the notification bell is rendered
    const notificationIcon = screen.getByTestId('notifications-icon');
    expect(notificationIcon).toBeInTheDocument();

    // Check if the badge shows the correct count of unread notifications
    const badge = notificationIcon.querySelector('.MuiBadge-badge');
    expect(badge).toHaveTextContent('1');
  });

  it('opens the notification dropdown when clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationBell />
        </BrowserRouter>
      </Provider>
    );

    // Click on the notification bell
    const notificationIcon = screen.getByTestId('notifications-icon');
    fireEvent.click(notificationIcon);

    // Check if the dropdown is displayed
    const dropdown = screen.getByTestId('notifications-dropdown');
    expect(dropdown).toBeInTheDocument();

    // Check if notifications are displayed in the dropdown
    expect(screen.getByText('Appointment Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Appointment Reminder')).toBeInTheDocument();
  });

  it('marks a notification as read when clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationBell />
        </BrowserRouter>
      </Provider>
    );

    // Click on the notification bell
    const notificationIcon = screen.getByTestId('notifications-icon');
    fireEvent.click(notificationIcon);

    // Click on the first notification
    const notification = screen.getByText('Appointment Confirmed').closest('li');
    if (notification) {
      fireEvent.click(notification);
    }

    // Check if markAsRead action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'notifications/markAsRead',
        payload: '1',
      })
    );
  });

  it('clears all notifications when "Clear All" is clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationBell />
        </BrowserRouter>
      </Provider>
    );

    // Click on the notification bell
    const notificationIcon = screen.getByTestId('notifications-icon');
    fireEvent.click(notificationIcon);

    // Click on the "Clear All" button
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);

    // Check if clearAll action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'notifications/clearAll',
      })
    );
  });
}); 