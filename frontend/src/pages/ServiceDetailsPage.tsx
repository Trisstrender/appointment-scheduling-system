import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMinutes, isBefore, isAfter, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { serviceService, availabilityService, appointmentService } from '../api';
import { Service, Availability } from '../types';
import { LoadingSpinner } from '../components/common';

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ start: Date; end: Date }[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        if (id) {
          setIsLoading(true);
          const serviceId = parseInt(id, 10);
          const serviceData = await serviceService.getServiceById(serviceId);
          setService(serviceData);

          // Get provider's availability
          const providerAvailabilities = await availabilityService.getAvailabilitiesByProviderId(
            serviceData.providerId
          );

          // Generate available dates based on provider's availability
          const dates = generateAvailableDates(providerAvailabilities);
          setAvailableDates(dates);
        }
      } catch (err) {
        setError('Failed to load service details. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceDetails();
  }, [id]);

  const generateAvailableDates = (availabilities: Availability[]): Date[] => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For recurring availabilities, add dates for the next 30 days
    const recurringAvailabilities = availabilities.filter((a) => a.recurring);
    if (recurringAvailabilities.length > 0) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(0, 0, 0, 0);

        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const hasAvailabilityOnDay = recurringAvailabilities.some((a) => a.dayOfWeek === dayOfWeek);

        if (hasAvailabilityOnDay) {
          dates.push(date);
        }
      }
    }

    // For specific date availabilities
    const specificDateAvailabilities = availabilities.filter((a) => !a.recurring && a.specificDate);
    specificDateAvailabilities.forEach((a) => {
      if (a.specificDate) {
        const date = new Date(a.specificDate);
        date.setHours(0, 0, 0, 0);
        if (isAfter(date, today)) {
          dates.push(date);
        }
      }
    });

    return dates;
  };

  const handleDateChange = async (date: Date | null) => {
    if (!date || !service) return;

    setSelectedDate(date);
    setSelectedTimeSlot(null);

    try {
      // Get provider's availability for the selected date
      const dayOfWeek = date.getDay();
      const dateString = format(date, 'yyyy-MM-dd');

      // Get recurring availability for this day of week
      const recurringAvailability = await availabilityService.getAvailabilitiesByProviderIdAndDayOfWeek(
        service.providerId,
        dayOfWeek
      );

      // Get specific date availability
      const specificDateAvailability = await availabilityService.getAvailabilitiesByProviderIdAndDate(
        service.providerId,
        dateString
      );

      // Combine availabilities
      const allAvailabilities = [...recurringAvailability, ...specificDateAvailability];

      // Get existing appointments for this date
      const appointments = await appointmentService.getAppointmentsByProviderIdAndDate(
        service.providerId,
        dateString
      );

      // Generate time slots based on availabilities and existing appointments
      const timeSlots = generateTimeSlots(allAvailabilities, appointments, service.durationMinutes);
      setAvailableTimeSlots(timeSlots);
    } catch (err) {
      setError('Failed to load available time slots. Please try again later.');
      console.error(err);
    }
  };

  const generateTimeSlots = (
    availabilities: Availability[],
    appointments: any[],
    durationMinutes: number
  ): { start: Date; end: Date }[] => {
    const timeSlots: { start: Date; end: Date }[] = [];
    const now = new Date();

    availabilities.forEach((availability) => {
      const startTime = parseISO(availability.startTime);
      const endTime = parseISO(availability.endTime);

      // Create time slots at 30-minute intervals
      let slotStart = new Date(startTime);
      while (isBefore(addMinutes(slotStart, durationMinutes), endTime)) {
        const slotEnd = addMinutes(slotStart, durationMinutes);

        // Check if the slot is in the future
        if (isAfter(slotStart, now)) {
          // Check if the slot overlaps with any existing appointments
          const isOverlapping = appointments.some((appointment) => {
            const appointmentStart = parseISO(appointment.startTime);
            const appointmentEnd = parseISO(appointment.endTime);
            return (
              (isBefore(slotStart, appointmentEnd) && isAfter(slotStart, appointmentStart)) ||
              (isBefore(slotEnd, appointmentEnd) && isAfter(slotEnd, appointmentStart)) ||
              (isBefore(appointmentStart, slotEnd) && isAfter(appointmentEnd, slotStart))
            );
          });

          if (!isOverlapping) {
            timeSlots.push({ start: slotStart, end: slotEnd });
          }
        }

        // Move to the next slot (30-minute intervals)
        slotStart = addMinutes(slotStart, 30);
      }
    });

    return timeSlots;
  };

  const handleTimeSlotChange = (event: SelectChangeEvent<string>) => {
    setSelectedTimeSlot(event.target.value);
  };

  const handleBookAppointment = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/services/${id}` } });
      return;
    }

    if (!service || !selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time for your appointment.');
      return;
    }

    try {
      const [startHour, startMinute] = selectedTimeSlot.split(':').map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = addMinutes(startDateTime, service.durationMinutes);

      const appointmentData = {
        clientId: user?.id,
        providerId: service.providerId,
        serviceId: service.id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: notes,
        status: 'PENDING',
      };

      await appointmentService.createAppointment(appointmentData);
      setSuccess(true);
      setError(null);

      // Reset form
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setNotes('');

      // Redirect to appointments page after a delay
      setTimeout(() => {
        navigate('/client/appointments');
      }, 3000);
    } catch (err) {
      setError('Failed to book appointment. Please try again later.');
      console.error(err);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading service details..." />;
  }

  if (!service) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Service not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Service Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h4" gutterBottom>
              {service.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Provided by {service.providerName}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {service.description || 'No description available.'}
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">{service.durationMinutes} minutes</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body1">${service.price.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Booking Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Book an Appointment
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Appointment booked successfully! Redirecting to your appointments...
              </Alert>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ mb: 3 }}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  shouldDisableDate={(date) => {
                    // Disable dates that are not in availableDates
                    return !availableDates.some(
                      (availableDate) => availableDate.toDateString() === date.toDateString()
                    );
                  }}
                  sx={{ width: '100%' }}
                />
              </Box>

              {selectedDate && (
                <Box sx={{ mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="time-slot-label">Select Time</InputLabel>
                    <Select
                      labelId="time-slot-label"
                      id="time-slot"
                      value={selectedTimeSlot || ''}
                      label="Select Time"
                      onChange={handleTimeSlotChange}
                    >
                      {availableTimeSlots.length === 0 ? (
                        <MenuItem disabled value="">
                          No available time slots
                        </MenuItem>
                      ) : (
                        availableTimeSlots.map((slot, index) => (
                          <MenuItem key={index} value={format(slot.start, 'HH:mm')}>
                            {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>
              )}

              <Box sx={{ mb: 3 }}>
                <TextField
                  label="Notes (Optional)"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  placeholder="Add any special requests or information for the service provider"
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTimeSlot || success}
              >
                Book Appointment
              </Button>

              {!isAuthenticated && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  You'll need to log in to complete your booking.
                </Typography>
              )}
            </LocalizationProvider>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ServiceDetailsPage;