import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Tabs,
  Tab,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format, parseISO, isAfter } from 'date-fns';
import CancelIcon from '@mui/icons-material/Cancel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../api';
import { Appointment } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointments-tabpanel-${index}`}
      aria-labelledby={`appointments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ClientAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          const clientAppointments = await appointmentService.getAppointmentsByClientId(user.id);
          setAppointments(clientAppointments);
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleCancelDialogClose = () => {
    setCancelDialogOpen(false);
    setSelectedAppointment(null);
    setCancelReason('');
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      // Add the cancel reason to the appointment notes
      const updatedNotes = selectedAppointment.notes
        ? `${selectedAppointment.notes}\n\nCancellation reason: ${cancelReason}`
        : `Cancellation reason: ${cancelReason}`;

      // Update the appointment status to CANCELLED
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, 'CANCELLED');
      
      // Update the appointment in the local state
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? { ...appointment, status: 'CANCELLED', notes: updatedNotes }
            : appointment
        )
      );

      handleCancelDialogClose();
    } catch (err) {
      setError('Failed to cancel appointment. Please try again later.');
      console.error(err);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return format(date, 'EEEE, MMMM d, yyyy h:mm a');
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return appointments.filter(
      (appointment) => isAfter(parseISO(appointment.startTime), now) && appointment.status !== 'CANCELLED'
    );
  };

  const getPastAppointments = () => {
    const now = new Date();
    return appointments.filter(
      (appointment) => !isAfter(parseISO(appointment.startTime), now) || appointment.status === 'CANCELLED'
    );
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const isPast = !isAfter(parseISO(appointment.startTime), new Date()) || appointment.status === 'CANCELLED';
    
    return (
      <Paper
        key={appointment.id}
        sx={{
          p: 3,
          mb: 2,
          borderLeft: 6,
          borderColor:
            appointment.status === 'CONFIRMED'
              ? 'success.main'
              : appointment.status === 'PENDING'
              ? 'warning.main'
              : appointment.status === 'CANCELLED'
              ? 'error.main'
              : 'grey.500',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h5" gutterBottom>
              {appointment.serviceName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              with {appointment.providerName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EventNoteIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {format(parseISO(appointment.startTime), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {format(parseISO(appointment.startTime), 'h:mm a')} - {format(parseISO(appointment.endTime), 'h:mm a')}
              </Typography>
            </Box>
            {appointment.notes && (
              <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
                Notes: {appointment.notes}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Chip
              label={appointment.status}
              color={
                appointment.status === 'CONFIRMED'
                  ? 'success'
                  : appointment.status === 'PENDING'
                  ? 'warning'
                  : appointment.status === 'CANCELLED'
                  ? 'error'
                  : 'default'
              }
              sx={{ mb: 2 }}
            />
            {!isPast && appointment.status !== 'CANCELLED' && (
              <Tooltip title="Cancel Appointment">
                <IconButton
                  color="error"
                  onClick={() => handleCancelClick(appointment)}
                  aria-label="cancel appointment"
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your appointments..." />;
  }

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          View and manage your scheduled appointments.
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 3 }}>
            {error}
          </Typography>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
            <Tab label={`Upcoming (${upcomingAppointments.length})`} id="appointments-tab-0" />
            <Tab label={`Past & Cancelled (${pastAppointments.length})`} id="appointments-tab-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {upcomingAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You don't have any upcoming appointments.
              </Typography>
              <Button component={RouterLink} to="/services" variant="contained" color="primary" sx={{ mt: 2 }}>
                Book an Appointment
              </Button>
            </Box>
          ) : (
            upcomingAppointments.map(renderAppointmentCard)
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pastAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                You don't have any past appointments.
              </Typography>
            </Box>
          ) : (
            pastAppointments.map(renderAppointmentCard)
          )}
        </TabPanel>
      </Paper>

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onClose={handleCancelDialogClose}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your appointment for{' '}
            <strong>{selectedAppointment?.serviceName}</strong> on{' '}
            {selectedAppointment && formatDateTime(selectedAppointment.startTime)}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for cancellation (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDialogClose} color="primary">
            Back
          </Button>
          <Button onClick={handleCancelAppointment} color="error" variant="contained">
            Cancel Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ClientAppointmentsPage;