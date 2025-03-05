import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Divider, 
  Card, 
  CardContent,
  CardActions,
  Chip,
  Avatar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService, serviceService, availabilityService } from '../../api';
import { Appointment, Service, Availability } from '../../types';
import { LoadingSpinner } from '../../components/common';

const ProviderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          
          // Fetch today's appointments
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
          // Using getAppointmentsByProviderId and filtering for today's date
          const appointmentsResponse = await appointmentService.getAppointmentsByProviderId(user.id);
          const appointmentsData = appointmentsResponse.data.data
            .filter((appointment: any) => appointment.startTime.includes(formattedDate))
            .map((item: any) => ({
              ...item,
              // Ensure required fields have default values if they're undefined
              createdAt: item.createdAt || '',
              updatedAt: item.updatedAt || '',
            }));
          setTodayAppointments(appointmentsData);
          
          // Fetch services
          const providerServicesResponse = await serviceService.getServicesByProviderId(user.id);
          const servicesData = providerServicesResponse.data.data.map((item: any) => ({
            ...item,
            // Ensure required fields have default values if they're undefined
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
          }));
          setServices(servicesData);
          
          // Fetch availabilities
          const providerAvailabilitiesResponse = await availabilityService.getAvailabilitiesByProviderId(user.id);
          const availabilityData = providerAvailabilitiesResponse.data.data.map((item: any) => ({
            ...item,
            // Ensure required fields have default values if they're undefined
            createdAt: item.createdAt || '',
            updatedAt: item.updatedAt || '',
          }));
          setAvailabilities(availabilityData);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      default:
        return 'default';
    }
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

        {/* Stats Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card sx={{ height: '100%', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <EventIcon />
                    <Typography variant="h4">{todayAppointments.length}</Typography>
                    <Typography variant="body2">Today's Appointments</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card sx={{ height: '100%', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <BusinessCenterIcon />
                    <Typography variant="h4">{services.length}</Typography>
                    <Typography variant="body2">Active Services</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ height: '100%', bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <AccessTimeIcon />
                    <Typography variant="h4">{availabilities.length}</Typography>
                    <Typography variant="body2">Availability Slots</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
              <Button
                component={RouterLink}
                to="/provider/appointments"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<EventIcon />}
              >
                Manage Appointments
              </Button>
              <Button
                component={RouterLink}
                to="/provider/services"
                variant="contained"
                color="secondary"
                fullWidth
                startIcon={<BusinessCenterIcon />}
              >
                Manage Services
              </Button>
              <Button
                component={RouterLink}
                to="/provider/availability"
                variant="contained"
                color="info"
                fullWidth
                startIcon={<AccessTimeIcon />}
              >
                Manage Availability
              </Button>
              <Button
                component={RouterLink}
                to="/provider/profile"
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<PersonIcon />}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Today's Appointments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1, overflow: 'auto' }}>
                {todayAppointments.map((appointment) => (
                  <Box
                    key={appointment.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">{appointment.serviceName}</Typography>
                      <Chip 
                        label={appointment.status} 
                        color={getStatusColor(appointment.status) as any}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                        {appointment.clientName?.charAt(0) || 'C'}
                      </Avatar>
                      <Typography variant="body2">{appointment.clientName}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </Typography>
                    <CardActions sx={{ p: 0, mt: 1 }}>
                      <Button
                        component={RouterLink}
                        to={`/provider/appointments/${appointment.id}`}
                        size="small"
                      >
                        Details
                      </Button>
                    </CardActions>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/provider/appointments"
                variant="text"
                color="primary"
              >
                View All
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Services Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Your Services
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {services.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't added any services yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/provider/services/new"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Add Your First Service
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {services.slice(0, 4).map((service) => (
                  <Grid item xs={12} sm={6} key={service.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" noWrap>{service.name}</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {service.durationMinutes} min | ${service.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          height: '40px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {service.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          component={RouterLink}
                          to={`/provider/services/${service.id}`}
                          size="small"
                        >
                          Edit
                        </Button>
                        <Chip 
                          label={service.active ? 'Active' : 'Inactive'} 
                          color={service.active ? 'success' : 'default'}
                          size="small"
                          sx={{ ml: 'auto' }}
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            {services.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  component={RouterLink}
                  to="/provider/services/new"
                  variant="contained"
                  color="primary"
                  size="small"
                >
                  Add New Service
                </Button>
                <Button
                  component={RouterLink}
                  to="/provider/services"
                  variant="text"
                  color="primary"
                >
                  Manage All Services
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Availability Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Your Availability
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {availabilities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't set up your availability yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/provider/availability"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1 }}
                >
                  Set Up Availability
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Recurring Schedule
                </Typography>
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {availabilities
                    .filter(a => a.recurring)
                    .slice(0, 5)
                    .map((availability) => (
                      <Grid item xs={12} key={availability.id}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          p: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="body2">
                            {getDayName(availability.dayOfWeek || 0)}
                          </Typography>
                          <Typography variant="body2">
                            {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  }
                </Grid>

                <Typography variant="subtitle1" gutterBottom>
                  Upcoming Special Dates
                </Typography>
                <Grid container spacing={1}>
                  {availabilities
                    .filter(a => !a.recurring && a.specificDate)
                    .slice(0, 3)
                    .map((availability) => (
                      <Grid item xs={12} key={availability.id}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          p: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Typography variant="body2">
                            {availability.specificDate ? formatDate(availability.specificDate) : ''}
                          </Typography>
                          <Typography variant="body2">
                            {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                          </Typography>
                        </Box>
                      </Grid>
                    ))
                  }
                </Grid>
              </Box>
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

// Helper function to get day name from day of week number
const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
};

export default ProviderDashboardPage;