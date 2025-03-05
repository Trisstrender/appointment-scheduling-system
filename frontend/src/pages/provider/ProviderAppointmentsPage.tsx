import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../hooks/useAuth';
import { appointmentService } from '../../api';
import { Appointment } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`appointment-tabpanel-${index}`}
      aria-labelledby={`appointment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `appointment-tab-${index}`,
    'aria-controls': `appointment-tabpanel-${index}`,
  };
}

const ProviderAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, [user?.id]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, tabValue, selectedDate, statusFilter, searchTerm]);

  const fetchAppointments = async () => {
    try {
      if (user?.id) {
        setIsLoading(true);
        const response = await appointmentService.getAppointmentsByProviderId(user.id);
        
        // Map the API response to match the expected Appointment type
        const appointmentData = response.data.data.map((item: any) => ({
          ...item,
          // Ensure required fields have default values if they're undefined
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
        }));
        
        setAppointments(appointmentData);
      }
    } catch (err) {
      setError('Failed to load appointments. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Filter by tab (upcoming, past, all)
    if (tabValue === 0) { // Upcoming
      filtered = filtered.filter(appointment => new Date(appointment.startTime) >= new Date());
    } else if (tabValue === 1) { // Past
      filtered = filtered.filter(appointment => new Date(appointment.startTime) < new Date());
    }

    // Filter by selected date
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter(appointment => appointment.startTime.includes(dateString));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(appointment => appointment.status.toUpperCase() === statusFilter.toUpperCase());
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.clientName?.toLowerCase().includes(term) ||
        appointment.serviceName?.toLowerCase().includes(term) ||
        appointment.notes?.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first for upcoming, oldest first for past)
    filtered.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return tabValue === 0 ? dateA - dateB : dateB - dateA;
    });

    setFilteredAppointments(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as string);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleOpenDetailsDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || '');
    setOpenDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
    setSelectedAppointment(null);
    setNotes('');
  };

  const handleOpenStatusDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedAppointment(null);
    setNewStatus('');
  };

  const handleUpdateStatus = async () => {
    try {
      if (selectedAppointment && newStatus) {
        await appointmentService.updateAppointmentStatus(selectedAppointment.id, newStatus);
        setSuccess(`Appointment status updated to ${newStatus}`);
        fetchAppointments();
        handleCloseStatusDialog();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update appointment status');
      console.error(err);
    }
  };

  const handleUpdateNotes = async () => {
    try {
      if (selectedAppointment) {
        await appointmentService.updateAppointment(selectedAppointment.id, { notes });
        setSuccess('Appointment notes updated successfully');
        fetchAppointments();
        handleCloseDetailsDialog();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update appointment notes');
      console.error(err);
    }
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

  const formatDate = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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

  const getStatusOptions = () => {
    return [
      { value: 'PENDING', label: 'Pending' },
      { value: 'CONFIRMED', label: 'Confirmed' },
      { value: 'COMPLETED', label: 'Completed' },
      { value: 'CANCELLED', label: 'Cancelled' },
      { value: 'NO_SHOW', label: 'No Show' },
    ];
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your appointments..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Appointments
          </Typography>
          <Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Filter by Date"
                value={selectedDate}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { mr: 2 },
                  },
                }}
              />
            </LocalizationProvider>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setSelectedDate(null)}
              size="small"
            >
              Clear Date
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your appointments, update status, and add notes.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          <AlertTitle>Success</AlertTitle>
          {success}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="appointment tabs"
            data-testid="appointment-tabs"
          >
            <Tab label="Upcoming" {...a11yProps(0)} data-testid="upcoming-tab" />
            <Tab label="Past" {...a11yProps(1)} data-testid="past-tab" />
            <Tab label="All" {...a11yProps(2)} data-testid="all-tab" />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              label="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Client name, service..."
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mr: 2, width: 250 }}
            />
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusFilterChange as any}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                {getStatusOptions().map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {filteredAppointments.length} appointments found
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="appointments table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 3 }}>
                      No appointments found matching your criteria
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAppointments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>{formatDate(appointment.startTime)}</TableCell>
                      <TableCell>
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </TableCell>
                      <TableCell>{appointment.clientName}</TableCell>
                      <TableCell>{appointment.serviceName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={appointment.status} 
                          color={getStatusColor(appointment.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDetailsDialog(appointment)}
                          title="View Details"
                        >
                          <EventIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleOpenStatusDialog(appointment)}
                          title="Update Status"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setNewStatus('COMPLETED');
                                setOpenStatusDialog(true);
                              }}
                              title="Mark as Completed"
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setNewStatus('CANCELLED');
                                setOpenStatusDialog(true);
                              }}
                              title="Cancel Appointment"
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAppointments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Appointment Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6">{selectedAppointment.serviceName}</Typography>
                  <Chip 
                    label={selectedAppointment.status} 
                    color={getStatusColor(selectedAppointment.status) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Client</Typography>
                  <Typography variant="body1">{selectedAppointment.clientName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1">{formatDateTime(selectedAppointment.startTime)}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    fullWidth
                    multiline
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this appointment..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Created</Typography>
                  <Typography variant="body2">{formatDateTime(selectedAppointment.createdAt)}</Typography>
                </Grid>
                {selectedAppointment.updatedAt !== selectedAppointment.createdAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                    <Typography variant="body2">{formatDateTime(selectedAppointment.updatedAt)}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>Cancel</Button>
          <Button onClick={handleUpdateNotes} variant="contained" color="primary">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status-select"
                value={newStatus}
                label="Status"
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {getStatusOptions().map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button onClick={handleUpdateStatus} variant="contained" color="primary">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderAppointmentsPage;