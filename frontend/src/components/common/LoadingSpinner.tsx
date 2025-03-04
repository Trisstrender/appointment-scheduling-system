import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 40 
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        padding: 4,
      }}
      data-testid="loading-spinner"
    >
      <CircularProgress size={size} />
      {message && (
        <Typography
          variant="body1"
          sx={{ mt: 2, textAlign: 'center' }}
          data-testid="loading-message"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;