import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import NotificationsWidget from '../NotificationsWidget';
import { BrowserRouter } from 'react-router-dom';

const mockStore = configureStore([]);

describe('NotificationsWidget Component', () => {
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
          {
            id: '3',
            type: 'APPOINTMENT_CANCELLED',
            title: 'Appointment Cancelled',
            message: 'Your appointment has been cancelled',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    store.dispatch = jest.fn();
  });

  it('renders the notifications widget with correct title', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationsWidget />
        </BrowserRouter>
      </Provider>
    );

    // Check if the widget is rendered with the correct title
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('displays the correct number of notifications based on maxItems prop', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationsWidget maxItems={2} />
        </BrowserRouter>
      </Provider>
    );

    // Check if only 2 notifications are displayed
    expect(screen.getByText('Appointment Confirmed')).toBeInTheDocument();
    expect(screen.getByText('Appointment Reminder')).toBeInTheDocument();
    expect(screen.queryByText('Appointment Cancelled')).not.toBeInTheDocument();

    // Check if "View All" button is displayed
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('marks a notification as read when clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationsWidget />
        </BrowserRouter>
      </Provider>
    );

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

  it('marks all notifications as read when "Mark All as Read" is clicked', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationsWidget />
        </BrowserRouter>
      </Provider>
    );

    // Click on the "Mark All as Read" button
    const markAllAsReadButton = screen.getByText('Mark All as Read');
    fireEvent.click(markAllAsReadButton);

    // Check if markAllAsRead action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'notifications/markAllAsRead',
      })
    );
  });

  it('displays "No notifications" message when there are no notifications', () => {
    store = mockStore({
      notifications: {
        notifications: [],
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <NotificationsWidget />
        </BrowserRouter>
      </Provider>
    );

    // Check if "No notifications" message is displayed
    expect(screen.getByText('No notifications')).toBeInTheDocument();

    // Check if "Mark All as Read" button is not displayed
    expect(screen.queryByText('Mark All as Read')).not.toBeInTheDocument();
  });
}); 