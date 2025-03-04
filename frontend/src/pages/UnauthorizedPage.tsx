import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import NoEncryptionIcon from '@mui/icons-material/NoEncryption';

const UnauthorizedPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <NoEncryptionIcon sx={{ fontSize: 100, color: 'error.main', mb: 2 }} />
        <Typography variant="h1" component="h1" gutterBottom>
          403
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 600, mb: 4 }}>
          You do not have permission to access this page. Please contact the administrator if you believe this is an
          error.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large">
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default UnauthorizedPage;