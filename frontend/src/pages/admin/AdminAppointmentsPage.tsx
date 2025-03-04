import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EventIcon from '@mui/icons-material/Event';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';
import { appointmentService, userService, serviceService } from '../../api';
import { Appointment, User, Service } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface AppointmentFormData {
  clientId: number;
  providerId: number;
  serviceId: number;
  startTime: Date;
  endTime: Date;
  status: string;
  notes: string;
}

const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [providers, setProviders] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState<'day' | 'week' | 'month'>('day');
  
  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: 0,
    providerId: 0,
    serviceId: 0,
    startTime: new Date(),
    endTime: new Date(),
    status: 'PENDING',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [providerServices, setProviderServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all appointments
        const allAppointments = await appointmentService.getAllAppointments();
        setAppointments(allAppointments);
        
        // Fetch all clients
        const allClients = await userService.getAllClients();
        setClients(allClients);
        
        // Fetch all providers
        const allProviders = await userService.getAllProviders();
        setProviders(allProviders);
        
        // Fetch all services
        const allServices = await serviceService.getAllServices();
        setServices(allServices);
        
        // Apply initial filters
        filterAppointments(allAppointments);
      } catch (err) {
        setError('Failed to load appointments. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter criteria change
    filterAppointments(appointments);
  }, [searchTerm, clientFilter, providerFilter, statusFilter, dateFilter, dateRangeFilter, appointments]);

  useEffect(() => {
    // Update available services when provider changes
    if (formData.providerId) {
      const providerServicesFiltered = services.filter(
        (service) => service.providerId === formData.providerId
      );
      setProviderServices(providerServicesFiltered);
      
      // Reset service selection if the current service doesn't belong to the selected provider
      if (
        formData.serviceId &&
        !providerServicesFiltered.some((service) => service.id === formData.serviceId)
      ) {
        setFormData({
          ...formData,
          serviceId: 0,
        });
      }
    } else {
      setProviderServices([]);
    }
  }, [formData.providerId, services]);

  const filterAppointments = (appointmentsToFilter: Appointment[]) => {
    let filtered = [...appointmentsToFilter];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (appointment) =>
          (appointment.clientName && appointment.clientName.toLowerCase().includes(term)) ||
          (appointment.providerName && appointment.providerName.toLowerCase().includes(term)) ||
          (appointment.serviceName && appointment.serviceName.toLowerCase().includes(term)) ||
          (appointment.notes && appointment.notes.toLowerCase().includes(term))
      );
    }

    // Filter by client
    if (clientFilter) {
      filtered = filtered.filter((appointment) => appointment.clientId.toString() === clientFilter);
    }

    // Filter by provider
    if (providerFilter) {
      filtered = filtered.filter((appointment) => appointment.providerId.toString() === providerFilter);
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((appointment) => appointment.status === statusFilter);
    }

    // Filter by date
    if (dateFilter) {
      const start = startOfDay(dateFilter);
      let end;

      switch (dateRangeFilter) {
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

      filtered = filtered.filter((appointment) => {
        const appointmentDate = parseISO(appointment.startTime);
        return appointmentDate >= start && appointmentDate <= end;
      });
    }

    setFilteredAppointments(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClientFilterChange = (event: SelectChangeEvent<string>) => {
    setClientFilter(event.target.value);
  };

  const handleProviderFilterChange = (event: SelectChangeEvent<string>) => {
    setProviderFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleDateRangeFilterChange = (event: SelectChangeEvent<string>) => {
    setDateRangeFilter(event.target.value as 'day' | 'week' | 'month');
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    
    // Parse dates
    const startTime = parseISO(appointment.startTime);
    const endTime = parseISO(appointment.endTime);
    
    setFormData({
      clientId: appointment.clientId,
      providerId: appointment.providerId,
      serviceId: appointment.serviceId,
      startTime,
      endTime,
      status: appointment.status,
      notes: appointment.notes || '',
    });
    
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleOpenStatusDialog = (appointment: Appointment, status: string) => {
    setSelectedAppointment(appointment);
    setNewStatus(status);
    setStatusNote('');
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
    setSelectedAppointment(null);
    setNewStatus('');
    setStatusNote('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleClientChange = (event: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      clientId: event.target.value as number,
    });
  };

  const handleProviderChange = (event: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      providerId: event.target.value as number,
      serviceId: 0, // Reset service when provider changes
    });
  };

  const handleServiceChange = (event: SelectChangeEvent<number>) => {
    const serviceId = event.target.value as number;
    setFormData({
      ...formData,
      serviceId,
    });
    
    // Update end time based on service duration
    if (serviceId) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        const endTime = new Date(formData.startTime);
        endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);
        setFormData((prev) => ({
          ...prev,
          endTime,
        }));
      }
    }
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      status: event.target.value,
    });
  };

  const handleStartTimeChange = (date: Date | null) => {
    if (!date) return;
    
    setFormData((prev) => {
      // Calculate new end time based on service duration
      let endTime = new Date(date);
      if (prev.serviceId) {
        const service = services.find((s) => s.id === prev.serviceId);
        if (service) {
          endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);
        }
      } else {
        // If no service selected, keep the same duration
        const currentDuration = prev.endTime.getTime() - prev.startTime.getTime();
        endTime = new Date(date.getTime() + currentDuration);
      }
      
      return {
        ...prev,
        startTime: date,
        endTime,
      };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate required fields
    if (!formData.clientId) {
      errors.clientId = 'Client is required';
      isValid = false;
    }
    
    if (!formData.providerId) {
      errors.providerId = 'Provider is required';
      isValid = false;
    }
    
    if (!formData.serviceId) {
      errors.serviceId = 'Service is required';
      isValid = false;
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
      isValid = false;
    }
    
    if (!formData.endTime) {
      errors.endTime = 'End time is required';
      isValid = false;
    }
    
    if (formData.startTime && formData.endTime && !isAfter(formData.endTime, formData.startTime)) {
      errors.endTime = 'End time must be after start time';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleUpdateAppointment = async () => {
    if (!validateForm() || !selectedAppointment) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const appointmentData: Partial<Appointment> = {
        clientId: formData.clientId,
        providerId: formData.providerId,
        serviceId: formData.serviceId,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        status: formData.status,
        notes: formData.notes,
      };
      
      const updatedAppointment = await appointmentService.updateAppointment(
        selectedAppointment.id,
        appointmentData
      );
      
      // Update in local state
      setAppointments(
        appointments.map((a) => (a.id === updatedAppointment.id ? updatedAppointment : a))
      );
      
      setSuccess('Appointment updated successfully');
      handleCloseEditDialog();
    } catch (err) {
      setError('Failed to update appointment. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedAppointment || !newStatus) return;
    
    try {
      setIsSaving(true);
      
      // Update the appointment status
      await appointmentService.updateAppointmentStatus(selectedAppointment.id, newStatus);
      
      // Add the status note to the appointment notes if provided
      if (statusNote) {
        const updatedNotes = selectedAppointment.notes
          ? `${selectedAppointment.notes}\n\nStatus update (${newStatus}): ${statusNote}`
          : `Status update (${newStatus}): ${statusNote}`;
        
        await appointmentService.updateAppointment(selectedAppointment.id, {
          notes: updatedNotes,
        });
      }
      
      // Update in local state
      const updatedAppointment = {
        ...selectedAppointment,
        status: newStatus,
        notes: statusNote
          ? selectedAppointment.notes
            ? `${selectedAppointment.notes}\n\nStatus update (${newStatus}): ${statusNote}`
            : `Status update (${newStatus}): ${statusNote}`
          : selectedAppointment.notes,
      };
      
      setAppointments(
        appointments.map((a) => (a.id === selectedAppointment.id ? updatedAppointment : a))
      );
      
      setSuccess(`Appointment status updated to ${newStatus}`);
      handleCloseStatusDialog();
    } catch (err) {
      setError('Failed to update appointment status. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAlertClose = () => {
    setSuccess(null);
    setError(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setClientFilter('');
    setProviderFilter('');
    setStatusFilter('ALL');
    setDateFilter(null);
    setDateRangeFilter('day');
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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
    return <LoadingSpinner message="Loading appointments..." />;
  }

  // Get current page of appointments
  const currentAppointments = filteredAppointments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Appointment Management
          </Typography>
          
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Search Appointments"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="client-filter-label">Client</InputLabel>
                  <Select
                    labelId="client-filter-label"
                    id="client-filter"
                    value={clientFilter}
                    label="Client"
                    onChange={handleClientFilterChange}
                  >
                    <MenuItem value="">All Clients</MenuItem>
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id.toString()}>
                        {client.firstName} {client.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="provider-filter-label">Provider</InputLabel>
                  <Select
                    labelId="provider-filter-label"
                    id="provider-filter"
                    value={providerFilter}
                    label="Provider"
                    onChange={handleProviderFilterChange}
                  >
                    <MenuItem value="">All Providers</MenuItem>
                    {providers.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id.toString()}>
                        {provider.firstName} {provider.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="status-filter-label">Status</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    id="status-filter"
                    value={statusFilter}
                    label="Status"
                    onChange={handleStatusFilterChange}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DatePicker
                  label="Date"
                  value={dateFilter}
                  onChange={(date) => setDateFilter(date)}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="date-range-label">Date Range</InputLabel>
                  <Select
                    labelId="date-range-label"
                    id="date-range"
                    value={dateRangeFilter}
                    label="Date Range"
                    onChange={handleDateRangeFilterChange}
                    disabled={!dateFilter}
                  >
                    <MenuItem value="day">Day</MenuItem>
                    <MenuItem value="week">Week</MenuItem>
                    <MenuItem value="month">Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  fullWidth
                  disabled={
                    !searchTerm &&
                    !clientFilter &&
                    !providerFilter &&
                    statusFilter === 'ALL' &&
                    !dateFilter
                  }
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Success/Error Alerts */}
          <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleAlertClose}>
            <Alert onClose={handleAlertClose} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
              {success || error}
            </Alert>
          </Snackbar>
          
          {/* Appointments Table */}
          {filteredAppointments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No appointments found matching your criteria.
              </Typography>
              {(searchTerm || clientFilter || providerFilter || statusFilter !== 'ALL' || dateFilter) && (
                <Button variant="text" color="primary" onClick={clearFilters} sx={{ mt: 2 }}>
                  Clear Filters
                </Button>
              )}
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="appointments table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Client</TableCell>
                      <TableCell>Provider</TableCell>
                      <TableCell>Service</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentAppointments.map((appointment) => (
                      <TableRow key={appointment.id} hover>
                        <TableCell>{appointment.clientName}</TableCell>
                        <TableCell>{appointment.providerName}</TableCell>
                        <TableCell>{appointment.serviceName}</TableCell>
                        <TableCell>
                          {formatDateTime(appointment.startTime)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(appointment)}
                            aria-label="edit appointment"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          {appointment.status === 'PENDING' && (
                            <IconButton
                              color="success"
                              onClick={() => handleOpenStatusDialog(appointment, 'CONFIRMED')}
                              aria-label="confirm appointment"
                              size="small"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          )}
                          {(appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
                            <IconButton
                              color="error"
                              onClick={() => handleOpenStatusDialog(appointment, 'CANCELLED')}
                              aria-label="cancel appointment"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          )}
                          {appointment.status === 'CONFIRMED' && (
                            <IconButton
                              color="info"
                              onClick={() => handleOpenStatusDialog(appointment, 'COMPLETED')}
                              aria-label="complete appointment"
                              size="small"
                            >
                              <EventIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
            </>
          )}
        </Paper>
        
        {/* Edit Appointment Dialog */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="md" fullWidth>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.clientId}>
                  <InputLabel id="client-label">Client</InputLabel>
                  <Select
                    labelId="client-label"
                    id="clientId"
                    value={formData.clientId}
                    label="Client"
                    onChange={handleClientChange}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.firstName} {client.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.clientId && <FormHelperText>{formErrors.clientId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" error={!!formErrors.providerId}>
                  <InputLabel id="provider-label">Provider</InputLabel>
                  <Select
                    labelId="provider-label"
                    id="providerId"
                    value={formData.providerId}
                    label="Provider"
                    onChange={handleProviderChange}
                  >
                    {providers.map((provider) => (
                      <MenuItem key={provider.id} value={provider.id}>
                        {provider.firstName} {provider.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.providerId && <FormHelperText>{formErrors.providerId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" error={!!formErrors.serviceId}>
                  <InputLabel id="service-label">Service</InputLabel>
                  <Select
                    labelId="service-label"
                    id="serviceId"
                    value={formData.serviceId}
                    label="Service"
                    onChange={handleServiceChange}
                    disabled={!formData.providerId}
                  >
                    {providerServices.map((service) => (
                      <MenuItem key={service.id} value={service.id}>
                        {service.name} - ${service.price.toFixed(2)} ({service.durationMinutes} min)
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.serviceId && <FormHelperText>{formErrors.serviceId}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date & Time"
                  value={formData.startTime}
                  onChange={handleStartTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      error: !!formErrors.startTime,
                      helperText: formErrors.startTime,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleStatusChange}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateAppointment}
              variant="contained"
              color="primary"
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Status Update Dialog */}
        <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
          <DialogTitle>
            {newStatus === 'CONFIRMED'
              ? 'Confirm Appointment'
              : newStatus === 'CANCELLED'
              ? 'Cancel Appointment'
              : 'Mark Appointment as Completed'}
          </DialogTitle>
          <DialogContent>
            <Typography paragraph>
              {newStatus === 'CONFIRMED'
                ? 'Are you sure you want to confirm this appointment?'
                : newStatus === 'CANCELLED'
                ? 'Are you sure you want to cancel this appointment?'
                : 'Are you sure you want to mark this appointment as completed?'}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Appointment Details:
            </Typography>
            <Typography>
              <strong>Client:</strong> {selectedAppointment?.clientName}
            </Typography>
            <Typography>
              <strong>Provider:</strong> {selectedAppointment?.providerName}
            </Typography>
            <Typography>
              <strong>Service:</strong> {selectedAppointment?.serviceName}
            </Typography>
            <Typography>
              <strong>Date & Time:</strong>{' '}
              {selectedAppointment && formatDateTime(selectedAppointment.startTime)}
            </Typography>
            <TextField
              margin="dense"
              id="statusNote"
              label="Add a note (optional)"
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
            <Button onClick={handleCloseStatusDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              color={
                newStatus === 'CONFIRMED'
                  ? 'success'
                  : newStatus === 'CANCELLED'
                  ? 'error'
                  : 'primary'
              }
              disabled={isSaving}
            >
              {isSaving ? (
                <CircularProgress size={24} />
              ) : newStatus === 'CONFIRMED' ? (
                'Confirm'
              ) : newStatus === 'CANCELLED' ? (
                'Cancel Appointment'
              ) : (
                'Mark as Completed'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default AdminAppointmentsPage;