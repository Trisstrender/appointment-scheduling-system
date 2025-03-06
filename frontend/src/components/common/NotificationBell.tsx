import React, { useState, useEffect } from 'react';
import { 
  Badge, 
  IconButton, 
  Popover, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Box, 
  Divider,
  ListItemIcon,
  Button,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    fetchNotifications, 
    markNotificationAsRead, 
    clearAllNotifications 
  } = useNotifications();
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    // Fetch latest notifications when opening the popover
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleClearAll = () => {
    clearAllNotifications();
    handleClose();
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

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton
        aria-describedby={id}
        onClick={handleClick}
        color="inherit"
        aria-label="notifications"
        data-testid="notifications-icon"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        data-testid="notifications-dropdown"
      >
        <Box sx={{ width: 320, maxHeight: 400 }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {notifications.length > 0 && (
              <Button size="small" onClick={handleClearAll}>
                Clear All
              </Button>
            )}
          </Box>
          <Divider />
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
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 300, overflow: 'auto' }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    alignItems="flex-start" 
                    sx={{ 
                      bgcolor: notification.read ? 'inherit' : 'action.hover',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleMarkAsRead(notification.id)}
                    data-testid="notification-item"
                    className={notification.read ? 'read' : ''}
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
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell; 