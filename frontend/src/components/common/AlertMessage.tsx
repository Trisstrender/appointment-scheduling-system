import React from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

interface AlertMessageProps {
  open: boolean;
  onClose: () => void;
  severity: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: string;
  autoHideDuration?: number;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  open,
  onClose,
  severity,
  title,
  message,
  autoHideDuration = 6000,
}) => {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage;