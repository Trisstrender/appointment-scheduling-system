import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { format, parseISO, isAfter, addDays, startOfDay, endOfDay } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

const ProviderAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          const providerAppointments = await appointmentService.getAppointmentsByProviderId(user.id);
          setAppointments(providerAppointments);
          filterAppointmentsByDate(providerAppointments, selectedDate, dateRange);
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

  useEffect(() => {
    filterAppointmentsByDate(appointments, selectedDate, dateRange);
  }, [selectedDate, dateRange]);

  const filterAppointmentsByDate = (
    allAppointments: Appointment[],
    date: Date | null,
    range: 'day' | 'week' | 'month'
  ) => {
    if (!date) {
      setFilteredAppointments(allAppointments);
      return;
    }

    const start = startOfDay(date);
    let end;

    switch (range) {
      case 'week':
        end = endOfDay(addDays(start, 6));
        break;
      case 'month':
        end = endOfDay(addDays(start, 29));
        break;
      default:
        end = endOfDay(start);
        break;
    }

    const filtered = allAppointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.startTime);
      return appointmentDate >= start && appointmentDate <= end;
    });

    setFilteredAppointments(filtered);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (event: SelectChangeEvent<string>) => {
    setDateRange(event.target.value as 'day' | 'week' | 'month');
  };

  const handleStatusClick = (appointment: Appointment, status: string) => {
    setSelectedAppointment(appointment);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const handleStatusDialogClose = () => {
    setStatusDialogOpen(false);
    setSelectedAppointment(null);
    setNewStatus('');
    setStatusNote('');
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || !newStatus) return;

    try {
      // Update the appointment status
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, newStatus);
      
      // Add the status note to the appointment notes if provided
      if (statusNote) {
        const updatedNotes = selectedAppointment.notes
          ? `${selectedAppointment.notes}\n\nStatus update (${newStatus}): ${statusNote}`
          : `Status update (${newStatus}): ${statusNote}`;
        
        await appointmentService.updateAppointment(selectedAppointment.id, {
          ...selectedAppointment,
          notes: updatedNotes,
        });
      }
      
      // Update the appointment in the local state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.id === selectedAppointment.id
          ? {
              ...appointment,
              status: newStatus,
              notes: statusNote
                ? appointment.notes
                  ? `${appointment.notes}\n\nStatus update (${newStatus}): ${statusNote}`
                  : `Status update (${newStatus}): ${statusNote}`
                : appointment.notes,
            }
          : appointment
      );
      
      setAppointments(updatedAppointments);
      filterAppointmentsByDate(updatedAppointments, selectedDate, dateRange);
      
      handleStatusDialogClose();
    } catch (err) {
      setError('Failed to update appointment status. Please try again later.');
      console.error(err);
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return format(date, 'EEEE, MMMM d, yyyy h:mm a');
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return filteredAppointments.filter(
      (appointment) => isAfter(parseISO(appointment.startTime), now) && appointment.status !== 'CANCELLED'
    );
  };

  const getPendingAppointments = () => {
    return filteredAppointments.filter((appointment) => appointment.status === 'PENDING');
  };

  const getCompletedAppointments = () => {
    const now = new Date();
    return filteredAppointments.filter(
      (appointment) =>
        (!isAfter(parseISO(appointment.startTime), now) && appointment.status !== 'CANCELLED') ||
        appointment.status === 'COMPLETED'
    );
  };

  const getCancelledAppointments = () => {
    return filteredAppointments.filter((appointment) => appointment.status === 'CANCELLED');
  };

  const renderAppointmentCard = (appointment: Appointment) => {
    const isPast = !isAfter(parseISO(appointment.startTime), new Date());
    const isPending = appointment.status === 'PENDING';
    const isConfirmed = appointment.status === 'CONFIRMED';
    const isCancelled = appointment.status === 'CANCELLED';
    
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
              : appointment.status === 'COMPLETED'
              ? 'info.main'
              : 'grey.500',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Typography variant="h5" gutterBottom>
              {appointment.serviceName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="subtitle1">
                {appointment.clientName}
              </Typography>
            </Box>
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
                  : appointment.status === 'COMPLETED'
                  ? 'info'
                  : 'default'
              }
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {isPending && (
                <Tooltip title="Confirm Appointment">
                  <IconButton
                    color="success"
                    onClick={() => handleStatusClick(appointment, 'CONFIRMED')}
                    aria-label="confirm appointment"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
              {(isPending || isConfirmed) && !isPast && (
                <Tooltip title="Cancel Appointment">
                  <IconButton
                    color="error"
                    onClick={() => handleStatusClick(appointment, 'CANCELLED')}
                    aria-label="cancel appointment"
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isConfirmed && isPast && !isCancelled && (
                <Tooltip title="Mark as Completed">
                  <IconButton
                    color="info"
                    onClick={() => handleStatusClick(appointment, 'COMPLETED')}
                    aria-label="complete appointment"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  const upcomingAppointments = getUpcomingAppointments();
  const pendingAppointments = getPendingAppointments();
  const completedAppointments = getCompletedAppointments();
  const cancelledAppointments = getCancelledAppointments();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Manage Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            View and manage your client appointments.
          </Typography>

          {error && (
            <Typography color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}

          {/* Date Filter */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="date-range-label">View Range</InputLabel>
                  <Select
                    labelId="date-range-label"
                    id="date-range"
                    value={dateRange}
                    label="View Range"
                    onChange={handleDateRangeChange}
                  >
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Showing appointments for{' '}
                  {dateRange === 'day'
                    ? format(selectedDate || new Date(), 'MMMM d, yyyy')
                    : dateRange === 'week'
                    ? `the week of ${format(selectedDate || new Date(), 'MMMM d, yyyy')}`
                    : `the month starting ${format(selectedDate || new Date(), 'MMMM d, yyyy')}`}
                </Typography>
                <Typography variant="body2">
                  Total: {filteredAppointments.length} appointments
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="appointment tabs">
              <Tab
                label={`Upcoming (${upcomingAppointments.length})`}
                id="appointments-tab-0"
                aria-controls="appointments-tabpanel-0"
              />
              <Tab
                label={`Pending (${pendingAppointments.length})`}
                id="appointments-tab-1"
                aria-controls="appointments-tabpanel-1"
              />
              <Tab
                label={`Completed (${completedAppointments.length})`}
                id="appointments-tab-2"
                aria-controls="appointments-tabpanel-2"
              />
              <Tab
                label={`Cancelled (${cancelledAppointments.length})`}
                id="appointments-tab-3"
                aria-controls="appointments-tabpanel-3"
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {upcomingAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No upcoming appointments for the selected period.
                </Typography>
              </Box>
            ) : (
              upcomingAppointments.map(renderAppointmentCard)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {pendingAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No pending appointments for the selected period.
                </Typography>
              </Box>
            ) : (
              pendingAppointments.map(renderAppointmentCard)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {completedAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No completed appointments for the selected period.
                </Typography>
              </Box>
            ) : (
              completedAppointments.map(renderAppointmentCard)
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            {cancelledAppointments.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No cancelled appointments for the selected period.
                </Typography>
              </Box>
            ) : (
              cancelledAppointments.map(renderAppointmentCard)
            )}
          </TabPanel>
        </Paper>

        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={handleStatusDialogClose}>
          <DialogTitle>
            {newStatus === 'CONFIRMED'
              ? 'Confirm Appointment'
              : newStatus === 'CANCELLED'
              ? 'Cancel Appointment'
              : 'Mark Appointment as Completed'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {newStatus === 'CONFIRMED'
                ? 'Are you sure you want to confirm this appointment?'
                : newStatus === 'CANCELLED'
                ? 'Are you sure you want to cancel this appointment?'
                : 'Are you sure you want to mark this appointment as completed?'}
              <br />
              <br />
              <strong>{selectedAppointment?.serviceName}</strong> with{' '}
              <strong>{selectedAppointment?.clientName}</strong> on{' '}
              {selectedAppointment && formatDateTime(selectedAppointment.startTime)}
            </DialogContentText>
            <TextField
              margin="dense"
              id="note"
              label={
                newStatus === 'CONFIRMED'
                  ? 'Add a note to the client (optional)'
                  : newStatus === 'CANCELLED'
                  ? 'Reason for cancellation (optional)'
                  : 'Add completion notes (optional)'
              }
              type="text"
              fullWidth
              multiline
              rows={3}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              variant="outlined"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleStatusDialogClose} color="primary">
              Back
            </Button>
            <Button
              onClick={handleUpdateStatus}
              color={
                newStatus === 'CONFIRMED'
                  ? 'success'
                  : newStatus === 'CANCELLED'
                  ? 'error'
                  : 'primary'
              }
              variant="contained"
            >
              {newStatus === 'CONFIRMED'
                ? 'Confirm Appointment'
                : newStatus === 'CANCELLED'
                ? 'Cancel Appointment'
                : 'Mark as Completed'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default ProviderAppointmentsPage;