import React, { useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  CardHeader,
  IconButton,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

interface NotificationsWidgetProps {
  maxItems?: number;
}

const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({ maxItems = 5 }) => {
  const navigate = useNavigate();
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead 
  } = useNotifications();
  
  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const displayedNotifications = notifications.slice(0, maxItems);
  const hasMoreNotifications = notifications.length > maxItems;
  
  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleViewAll = () => {
    // Navigate to notifications page or open notifications panel
    // For now, we'll just mark all as read
    handleMarkAllAsRead();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED':
        return <CheckCircleIcon color="success" />;
      case 'APPOINTMENT_CANCELLED':
        return <CancelIcon color="error" />;
      case 'APPOINTMENT_REMINDER':
        return <AccessTimeIcon color="primary" />;
      case 'NEW_APPOINTMENT':
        return <EventIcon color="primary" />;
      default:
        return <NotificationsIcon color="action" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as read
    handleMarkAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.data?.appointmentId) {
      navigate(`/appointments/${notification.data.appointmentId}`);
    }
  };

  return (
    <Card data-testid="notifications-widget">
      <CardHeader
        title="Notifications"
        action={
          <Box>
            <IconButton aria-label="refresh" onClick={handleRefresh} size="small" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
            <IconButton aria-label="settings" size="small">
              <MoreHorizIcon />
            </IconButton>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : displayedNotifications.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {displayedNotifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  alignItems="flex-start" 
                  sx={{ 
                    bgcolor: notification.read ? 'inherit' : 'action.hover',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block' }}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
          {hasMoreNotifications && (
            <Button size="small" onClick={handleViewAll}>
              View All
            </Button>
          )}
          {displayedNotifications.length > 0 && (
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default NotificationsWidget; 