import React, { useEffect, useState } from 'react';
import { Box, Container, Grid, Paper, Typography, Button, Divider, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService, userService, serviceService } from '../../api';
import { Appointment, User, Service } from '../../types';
import { LoadingSpinner } from '../../components/common';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalProviders: 0,
    totalAdmins: 0,
    totalServices: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recent appointments
        const recentAppointments = await appointmentService.getAllAppointments();
        setAppointments(recentAppointments.slice(0, 5));
        
        // Fetch users
        const allUsers = await userService.getAllUsers();
        setUsers(allUsers.slice(0, 5));
        
        // Fetch services
        const allServices = await serviceService.getAllServices();
        setServices(allServices.slice(0, 5));
        
        // Calculate stats
        const clients = allUsers.filter(u => u.userType === 'CLIENT');
        const providers = allUsers.filter(u => u.userType === 'PROVIDER');
        const admins = allUsers.filter(u => u.userType === 'ADMIN');
        const pendingAppts = recentAppointments.filter(a => a.status === 'PENDING');
        
        setStats({
          totalClients: clients.length,
          totalProviders: providers.length,
          totalAdmins: admins.length,
          totalServices: allServices.length,
          totalAppointments: recentAppointments.length,
          pendingAppointments: pendingAppts.length,
        });
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome to the administration panel. Here you can manage users, services, and appointments.
            </Typography>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Users
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PersonIcon color="info" />
                    <Typography variant="h6">{stats.totalClients}</Typography>
                    <Typography variant="body2" color="text.secondary">Clients</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WorkIcon color="success" />
                    <Typography variant="h6">{stats.totalProviders}</Typography>
                    <Typography variant="body2" color="text.secondary">Providers</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AdminPanelSettingsIcon color="warning" />
                    <Typography variant="h6">{stats.totalAdmins}</Typography>
                    <Typography variant="body2" color="text.secondary">Admins</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Button
                component={RouterLink}
                to="/admin/users"
                variant="text"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessCenterIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Services
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h3" align="center" sx={{ my: 2 }}>
                {stats.totalServices}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Total services available
              </Typography>
              <Button
                component={RouterLink}
                to="/admin/services"
                variant="text"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Manage Services
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h5" component="div">
                  Appointments
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{stats.totalAppointments}</Typography>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6">{stats.pendingAppointments}</Typography>
                    <Typography variant="body2" color="text.secondary">Pending</Typography>
                  </Box>
                </Grid>
              </Grid>
              <Button
                component={RouterLink}
                to="/admin/appointments"
                variant="text"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Manage Appointments
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={RouterLink}
                  to="/admin/users/new"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<PersonIcon />}
                >
                  Add New User
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={RouterLink}
                  to="/admin/services/new"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<BusinessCenterIcon />}
                >
                  Add New Service
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={RouterLink}
                  to="/admin/appointments/pending"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<EventIcon />}
                >
                  Review Pending Appointments
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  component={RouterLink}
                  to="/admin/reports"
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<EventIcon />}
                >
                  Generate Reports
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Appointments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Appointments
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {appointments.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No appointments found.
              </Typography>
            ) : (
              appointments.map((appointment) => (
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
                  <Typography variant="subtitle1">{appointment.serviceName}</Typography>
                  <Typography variant="body2">
                    Client: {appointment.clientName} | Provider: {appointment.providerName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDateTime(appointment.startTime)}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          appointment.status === 'CONFIRMED'
                            ? 'success.main'
                            : appointment.status === 'PENDING'
                            ? 'warning.main'
                            : appointment.status === 'CANCELLED'
                            ? 'error.main'
                            : 'text.secondary',
                      }}
                    >
                      {appointment.status}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/admin/appointments/${appointment.id}`}
                      variant="text"
                      size="small"
                    >
                      Details
                    </Button>
                  </Box>
                </Box>
              ))
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/admin/appointments"
                variant="text"
                color="primary"
              >
                View All Appointments
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Recent Users
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {users.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No users found.
              </Typography>
            ) : (
              users.map((user) => (
                <Box
                  key={user.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="subtitle1">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2">{user.email}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          user.userType === 'PROVIDER'
                            ? 'success.main'
                            : user.userType === 'CLIENT'
                            ? 'info.main'
                            : 'warning.main',
                      }}
                    >
                      {user.userType}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/admin/users/${user.id}`}
                      variant="text"
                      size="small"
                    >
                      Details
                    </Button>
                  </Box>
                </Box>
              ))
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={RouterLink}
                to="/admin/users"
                variant="text"
                color="primary"
              >
                View All Users
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboardPage;