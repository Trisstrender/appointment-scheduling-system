import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Button, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../api';
import { Appointment } from '../../types';
import { LoadingSpinner } from '../../components/common';

const ClientDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          const upcoming = await appointmentService.getAppointmentsByClientId(user.id, true);
          const past = await appointmentService.getAppointmentsByClientId(user.id, false);
          setUpcomingAppointments(upcoming);
          setPastAppointments(past);
        }
      } catch (err) {
        setError('Failed to load appointments. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user?.id]);

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
              This is your personal dashboard where you can manage your appointments and services.
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
                to="/services"
                variant="contained"
                color="primary"
                fullWidth
              >
                Book New Appointment
              </Button>
              <Button
                component={RouterLink}
                to="/client/appointments"
                variant="outlined"
                color="primary"
                fullWidth
              >
                View All Appointments
              </Button>
              <Button
                component={RouterLink}
                to="/client/profile"
                variant="outlined"
                color="primary"
                fullWidth
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Upcoming Appointments */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {upcomingAppointments.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any upcoming appointments.{' '}
                <RouterLink to="/services">Book one now!</RouterLink>
              </Typography>
            ) : (
              upcomingAppointments.map((appointment) => (
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
                      <Typography variant="body1">with {appointment.providerName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(appointment.startTime)} - {formatDateTime(appointment.endTime)}
                      </Typography>
                      {appointment.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Notes: {appointment.notes}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <Button
                        component={RouterLink}
                        to={`/client/appointments/${appointment.id}`}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ))
            )}
            {upcomingAppointments.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to="/client/appointments"
                  variant="text"
                  color="primary"
                >
                  View All
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Past Appointments */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {pastAppointments.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                You don't have any past appointments.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {pastAppointments.slice(0, 3).map((appointment) => (
                  <Grid item xs={12} sm={6} md={4} key={appointment.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        height: '100%',
                      }}
                    >
                      <Typography variant="h6">{appointment.serviceName}</Typography>
                      <Typography variant="body2">with {appointment.providerName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(appointment.startTime)}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Status: {appointment.status}
                        </Typography>
                        <Button
                          component={RouterLink}
                          to={`/client/appointments/${appointment.id}`}
                          variant="text"
                          size="small"
                        >
                          Details
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
            {pastAppointments.length > 3 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={RouterLink}
                  to="/client/appointments"
                  variant="text"
                  color="primary"
                >
                  View All
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboardPage;