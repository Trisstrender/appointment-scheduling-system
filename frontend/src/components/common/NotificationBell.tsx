import React, { useState } from 'react';
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
  Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { markAsRead, clearAll } from '../../store/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.notifications);
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };

  const handleClearAll = () => {
    dispatch(clearAll());
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
          {notifications.length === 0 ? (
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