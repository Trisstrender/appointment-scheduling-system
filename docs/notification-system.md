# Notification System

The Appointment Scheduling System includes a comprehensive notification system that keeps users informed about their appointments and other important events. This document provides an overview of the notification system and how to use it.

## Overview

The notification system consists of the following components:

1. **Notification Bell**: A bell icon in the header that displays the number of unread notifications.
2. **Notification Dropdown**: A dropdown that appears when the notification bell is clicked, showing a list of notifications.
3. **Notifications Widget**: A widget that can be placed on dashboards to display notifications.
4. **Redux Store**: A Redux slice that manages the notification state.
5. **API Service**: A service that handles API calls for notifications.

## Notification Types

The system supports the following notification types:

- `APPOINTMENT_CONFIRMED`: Sent when an appointment is confirmed.
- `APPOINTMENT_CANCELLED`: Sent when an appointment is cancelled.
- `APPOINTMENT_REMINDER`: Sent as a reminder for an upcoming appointment.
- `NEW_APPOINTMENT`: Sent to providers when a new appointment is booked.

## Components

### NotificationBell

The `NotificationBell` component displays a bell icon in the header with a badge showing the number of unread notifications. When clicked, it shows a dropdown with a list of notifications.

```jsx
import { NotificationBell } from '../components/common';

// In your component
return (
  <div>
    <NotificationBell />
  </div>
);
```

### NotificationsWidget

The `NotificationsWidget` component displays a card with a list of notifications. It can be placed on dashboards or other pages.

```jsx
import { NotificationsWidget } from '../components/common';

// In your component
return (
  <div>
    <NotificationsWidget maxItems={5} />
  </div>
);
```

## Redux Store

The notification state is managed by a Redux slice. The slice provides the following actions:

- `addNotification`: Adds a new notification.
- `markAsRead`: Marks a notification as read.
- `markAllAsRead`: Marks all notifications as read.
- `removeNotification`: Removes a notification.
- `clearAll`: Removes all notifications.
- `loadDemoNotifications`: Loads demo notifications for testing.

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  removeNotification, 
  clearAll 
} from '../store/slices/notificationSlice';

// In your component
const dispatch = useDispatch();
const { notifications } = useSelector((state) => state.notifications);

// Add a notification
dispatch(addNotification({
  type: 'APPOINTMENT_CONFIRMED',
  title: 'Appointment Confirmed',
  message: 'Your appointment has been confirmed.',
  data: {
    appointmentId: '123',
    serviceName: 'Swedish Massage',
    dateTime: new Date().toISOString()
  }
}));

// Mark a notification as read
dispatch(markAsRead('notification-id'));

// Mark all notifications as read
dispatch(markAllAsRead());

// Remove a notification
dispatch(removeNotification('notification-id'));

// Clear all notifications
dispatch(clearAll());
```

## API Service

The notification service handles API calls for notifications. It provides the following methods:

- `getNotifications`: Gets all notifications for the current user.
- `markNotificationAsRead`: Marks a notification as read.
- `markAllNotificationsAsRead`: Marks all notifications as read.
- `deleteNotification`: Deletes a notification.
- `deleteAllNotifications`: Deletes all notifications.

```javascript
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  deleteAllNotifications 
} from '../api';

// Get notifications
const notifications = await getNotifications();

// Mark a notification as read
await markNotificationAsRead('notification-id');

// Mark all notifications as read
await markAllNotificationsAsRead();

// Delete a notification
await deleteNotification('notification-id');

// Delete all notifications
await deleteAllNotifications();
```

## Custom Hook

The notification system includes a custom hook that makes it easier to use the notification system. The hook provides the following methods:

```javascript
import { useNotifications } from '../hooks/useNotifications';

// In your component
const {
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
} = useNotifications();

// Get unread count
console.log(`You have ${unreadCount} unread notifications`);

// Add a custom notification
addNewNotification({
  type: 'CUSTOM_TYPE',
  title: 'Custom Notification',
  message: 'This is a custom notification',
  data: {
    customData: 'Custom data'
  }
});

// Add an appointment confirmation notification
addAppointmentConfirmation('123', 'Swedish Massage', new Date().toISOString());

// Add an appointment cancellation notification
addAppointmentCancellation('123', 'Swedish Massage', new Date().toISOString());

// Add an appointment reminder notification
addAppointmentReminder('123', 'Swedish Massage', new Date().toISOString());

// Add a new appointment notification
addNewAppointmentNotification('123', 'John Doe', 'Swedish Massage', new Date().toISOString());

// Mark a notification as read
markNotificationAsRead('notification-id');

// Mark all notifications as read
markAllNotificationsAsRead();

// Remove a notification
removeNotificationById('notification-id');

// Clear all notifications
clearAllNotifications();

// Get notifications by type
const confirmations = getNotificationsByType('APPOINTMENT_CONFIRMED');

// Get unread notifications
const unread = getUnreadNotifications();

// Get read notifications
const read = getReadNotifications();
```

## Testing

The notification system includes comprehensive tests:

1. **Unit Tests**: Tests for the `NotificationBell` and `NotificationsWidget` components.
2. **Cypress Tests**: End-to-end tests for the notification system.

### Cypress Commands

The following Cypress commands are available for testing the notification system:

- `cy.openNotificationDropdown()`: Opens the notification dropdown.
- `cy.getUnreadNotificationCount()`: Gets the number of unread notifications.
- `cy.markNotificationAsRead(index)`: Marks a notification as read.
- `cy.markAllNotificationsAsRead()`: Marks all notifications as read.
- `cy.checkNotificationsWidget()`: Checks if the notifications widget is displayed.

```javascript
// Open notification dropdown
cy.openNotificationDropdown();

// Get unread notification count
cy.getUnreadNotificationCount().then((count) => {
  // Do something with the count
});

// Mark a notification as read
cy.markNotificationAsRead();

// Mark all notifications as read
cy.markAllNotificationsAsRead();

// Check notifications widget
cy.checkNotificationsWidget();
```

## Best Practices

1. **Use the Redux Store**: Always use the Redux store to manage notification state.
2. **Handle Errors**: Always handle errors when making API calls.
3. **Test Thoroughly**: Write comprehensive tests for the notification system.
4. **Use Custom Hooks**: Consider creating custom hooks for common notification operations.
5. **Keep Notifications Concise**: Keep notification messages short and to the point.
6. **Provide Context**: Include relevant data in the notification to provide context.
7. **Use Appropriate Icons**: Use appropriate icons for different notification types.
8. **Limit Notifications**: Don't overwhelm users with too many notifications.

## Future Improvements

1. **Real-time Notifications**: Implement WebSockets for real-time notifications.
2. **Notification Preferences**: Allow users to set notification preferences.
3. **Email Notifications**: Send email notifications for important events.
4. **Push Notifications**: Implement push notifications for mobile devices.
5. **Notification History**: Implement a notification history page.
6. **Notification Filters**: Allow users to filter notifications by type.
7. **Notification Groups**: Group related notifications together.
8. **Notification Actions**: Allow users to take actions directly from notifications. 