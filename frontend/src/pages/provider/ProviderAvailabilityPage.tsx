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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuth } from '../../hooks/useAuth';
import { availabilityService } from '../../api';
import { Availability } from '../../types';
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
      id={`availability-tabpanel-${index}`}
      aria-labelledby={`availability-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `availability-tab-${index}`,
    'aria-controls': `availability-tabpanel-${index}`,
  };
}

const ProviderAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isRecurring, setIsRecurring] = useState(true);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<number | ''>('');
  const [specificDate, setSpecificDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  useEffect(() => {
    fetchAvailabilities();
  }, [user?.id]);

  const fetchAvailabilities = async () => {
    try {
      if (user?.id) {
        setIsLoading(true);
        const response = await availabilityService.getAvailabilitiesByProviderId(user.id);
        // Map the API response to match the expected Availability type
        const availabilityData = response.data.data.map((item: any) => ({
          ...item,
          // Ensure required fields have default values if they're undefined
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
        }));
        setAvailabilities(availabilityData);
      }
    } catch (err) {
      setError('Failed to load availabilities. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (recurring: boolean = true, availability?: Availability) => {
    setIsRecurring(recurring);
    if (availability) {
      setEditingAvailability(availability);
      if (recurring && availability.dayOfWeek !== undefined) {
        setDayOfWeek(availability.dayOfWeek);
      } else if (!recurring && availability.specificDate) {
        setSpecificDate(new Date(availability.specificDate));
      }
      setStartTime(new Date(`2023-01-01T${availability.startTime}`));
      setEndTime(new Date(`2023-01-01T${availability.endTime}`));
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingAvailability(null);
    setDayOfWeek('');
    setSpecificDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const validateForm = (): boolean => {
    if (isRecurring && dayOfWeek === '') {
      setError('Please select a day of the week');
      return false;
    }
    if (!isRecurring && !specificDate) {
      setError('Please select a specific date');
      return false;
    }
    if (!startTime) {
      setError('Please select a start time');
      return false;
    }
    if (!endTime) {
      setError('Please select an end time');
      return false;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return false;
    }
    return true;
  };

  const formatTimeForAPI = (date: Date): string => {
    return date.toTimeString().split(' ')[0];
  };

  const handleSaveAvailability = async () => {
    try {
      if (!validateForm()) return;

      setError(null);
      
      const availabilityData = {
        recurring: isRecurring,
        dayOfWeek: isRecurring ? dayOfWeek as number : undefined,
        specificDate: !isRecurring && specificDate ? specificDate.toISOString().split('T')[0] : undefined,
        startTime: startTime ? formatTimeForAPI(startTime) : '',
        endTime: endTime ? formatTimeForAPI(endTime) : '',
      };

      if (editingAvailability) {
        // Update existing availability
        await availabilityService.updateAvailability(editingAvailability.id, availabilityData);
        setSuccess('Availability updated successfully');
      } else {
        // Create new availability
        if (user?.id) {
          await availabilityService.createAvailability(user.id, availabilityData);
          setSuccess('Availability added successfully');
        }
      }

      handleCloseDialog();
      fetchAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save availability');
      console.error(err);
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    try {
      await availabilityService.deleteAvailability(id);
      setSuccess('Availability deleted successfully');
      fetchAvailabilities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete availability');
      console.error(err);
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(`2023-01-01T${timeStr}`);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || '';
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your availability..." />;
  }

  const recurringAvailabilities = availabilities.filter(a => a.recurring);
  const specificAvailabilities = availabilities.filter(a => !a.recurring);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Manage Availability
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AccessTimeIcon />}
              onClick={() => handleOpenDialog(true)}
              sx={{ mr: 1 }}
            >
              Add Weekly Hours
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<EventIcon />}
              onClick={() => handleOpenDialog(false)}
            >
              Add Special Date
            </Button>
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Set your regular working hours and special dates to let clients know when you're available for appointments.
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
            aria-label="availability tabs"
            data-testid="availability-tabs"
          >
            <Tab label="Weekly Schedule" {...a11yProps(0)} data-testid="weekly-tab" />
            <Tab label="Special Dates" {...a11yProps(1)} data-testid="special-dates-tab" />
            <Tab label="Calendar View" {...a11yProps(2)} data-testid="calendar-view-tab" />
          </Tabs>
        </Box>

        {/* Weekly Schedule Tab */}
        <TabPanel value={tabValue} index={0}>
          {recurringAvailabilities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You haven't set up your weekly schedule yet
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog(true)}
                sx={{ mt: 2 }}
              >
                Add Weekly Hours
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const dayAvailabilities = recurringAvailabilities.filter(a => a.dayOfWeek === day);
                return (
                  <Grid item xs={12} key={day}>
                    <Card sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">{getDayName(day)}</Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              setDayOfWeek(day);
                              handleOpenDialog(true);
                            }}
                          >
                            Add Hours
                          </Button>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        {dayAvailabilities.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No availability set for this day
                          </Typography>
                        ) : (
                          dayAvailabilities.map((availability) => (
                            <Box
                              key={availability.id}
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1,
                                mb: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            >
                              <Typography>
                                {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                              </Typography>
                              <Box>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(true, availability)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteAvailability(availability.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </TabPanel>

        {/* Special Dates Tab */}
        <TabPanel value={tabValue} index={1}>
          {specificAvailabilities.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                You haven't set up any special dates
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog(false)}
                sx={{ mt: 2 }}
              >
                Add Special Date
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {specificAvailabilities
                .sort((a, b) => new Date(a.specificDate || '').getTime() - new Date(b.specificDate || '').getTime())
                .map((availability) => (
                  <Grid item xs={12} sm={6} md={4} key={availability.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {availability.specificDate ? formatDate(availability.specificDate) : 'No date specified'}
                        </Typography>
                        <Typography variant="body1">
                          {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog(false, availability)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteAvailability(availability.id)}
                        >
                          Delete
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </TabPanel>

        {/* Calendar View Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Calendar View Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary">
              We're working on a calendar view to help you visualize your availability and appointments.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      {/* Add/Edit Availability Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAvailability
            ? 'Edit Availability'
            : isRecurring
            ? 'Add Weekly Availability'
            : 'Add Special Date Availability'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              {isRecurring ? (
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                    <Select
                      labelId="day-of-week-label"
                      id="dayOfWeek"
                      value={dayOfWeek}
                      label="Day of Week"
                      onChange={(e) => setDayOfWeek(e.target.value as number)}
                    >
                      <MenuItem value={0}>Sunday</MenuItem>
                      <MenuItem value={1}>Monday</MenuItem>
                      <MenuItem value={2}>Tuesday</MenuItem>
                      <MenuItem value={3}>Wednesday</MenuItem>
                      <MenuItem value={4}>Thursday</MenuItem>
                      <MenuItem value={5}>Friday</MenuItem>
                      <MenuItem value={6}>Saturday</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={specificDate}
                      onChange={(newValue) => setSpecificDate(newValue)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={(newValue) => setStartTime(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={(newValue) => setEndTime(newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAvailability} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderAvailabilityPage;