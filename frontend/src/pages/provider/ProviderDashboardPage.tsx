import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Button, Divider, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService, serviceService, availabilityService } from '../../api';
import { Appointment, Service, Availability } from '../../types';
import { LoadingSpinner } from '../../components/common';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import TodayIcon from '@mui/icons-material/Today';

const ProviderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          
          // Get today's date in YYYY-MM-DD format
          const today = new Date().toISOString().split('T')[0];
          
          // Fetch today's appointments
          const appointments = await appointmentService.getAppointmentsByProviderIdAndDate(user.id, today);
          setTodayAppointments(appointments);
          
          // Fetch services
          const providerServices = await serviceService.getServicesByProviderId(user.id, true);
          setServices(providerServices);
          
          // Fetch availabilities
          const providerAvailabilities = await availabilityService.getAvailabilitiesByProviderId(user.id, true);
          setAvailabilities(providerAvailabilities);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDayOfWeekName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.firstName}!
            </Typography>
            <Typography variant="body1">
              This is your provider dashboard where you can manage your services, availability, and appointments.
            </Typography>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/provider/services/new"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<BusinessCenterIcon />}
              >
                Add New Service
              </Button>
              <Button
                component={RouterLink}
                to="/provider/availability/new"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<EventAvailableIcon />}
              >
                Add Availability
              </Button>
              <Button
                component={RouterLink}
                to="/provider/appointments"
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<TodayIcon />}
              >
                View All Appointments
              </Button>
              <Button
                component={RouterLink}
                to="/provider/profile"
                variant="outlined"
                color="primary"
                fullWidth
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Today's Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {todayAppointments.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any appointments scheduled for today.
              </Typography>
            ) : (
              todayAppointments.map((appointment) => (
                <Box
                  key={appointment.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="h6">{appointment.serviceName}</Typography>
                      <Typography variant="body1">Client: {appointment.clientName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </Typography>
                      {appointment.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Notes: {appointment.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Chip 
                        label={appointment.status} 
                        color={
                          appointment.status === 'CONFIRMED' ? 'success' : 
                          appointment.status === 'PENDING' ? 'warning' : 
                          appointment.status === 'CANCELLED' ? 'error' : 'default'
                        }
                        sx={{ mr: 1 }}
                      />
                      <Button
                        component={RouterLink}
                        to={`/provider/appointments/${appointment.id}`}
                        variant="outlined"
                        size="small"
                      >
                        Details
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/provider/appointments"
                variant="text"
                color="primary"
              >
                View All Appointments
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Services */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Your Services
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {services.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You haven't added any services yet.{' '}
                <RouterLink to="/provider/services/new">Add your first service</RouterLink>
              </Typography>
            ) : (
              services.slice(0, 3).map((service) => (
                <Box
                  key={service.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6">{service.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {service.durationMinutes} minutes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Price: ${service.price.toFixed(2)}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={RouterLink}
                      to={`/provider/services/${service.id}`}
                      variant="text"
                      size="small"
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
              ))
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/provider/services"
                variant="text"
                color="primary"
              >
                Manage Services
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Availability */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Your Availability
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {availabilities.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You haven't set your availability yet.{' '}
                <RouterLink to="/provider/availability/new">Set your availability</RouterLink>
              </Typography>
            ) : (
              availabilities.slice(0, 3).map((availability) => (
                <Box
                  key={availability.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="h6">
                    {availability.recurring
                      ? `Every ${getDayOfWeekName(availability.dayOfWeek || 0)}`
                      : `${new Date(availability.specificDate || '').toLocaleDateString()}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      component={RouterLink}
                      to={`/provider/availability/${availability.id}`}
                      variant="text"
                      size="small"
                    >
                      Edit
                    </Button>
                  </Box>
                </Box>
              ))
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/provider/availability"
                variant="text"
                color="primary"
              >
                Manage Availability
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProviderDashboardPage;