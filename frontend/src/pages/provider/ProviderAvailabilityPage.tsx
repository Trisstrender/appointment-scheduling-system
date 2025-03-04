import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO, addMinutes, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useAuth } from '../../hooks/useAuth';
import { availabilityService } from '../../api';
import { Availability } from '../../types';
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
      id={`availability-tabpanel-${index}`}
      aria-labelledby={`availability-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ProviderAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    recurring: true,
    dayOfWeek: 1, // Monday
    specificDate: new Date(),
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(17, 0, 0, 0)),
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          const providerAvailabilities = await availabilityService.getAvailabilitiesByProviderId(user.id);
          setAvailabilities(providerAvailabilities);
        }
      } catch (err) {
        setError('Failed to load availabilities. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilities();
  }, [user?.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (availability?: Availability) => {
    if (availability) {
      // Edit mode
      setIsEditing(true);
      setSelectedAvailability(availability);
      
      const startTime = parseISO(availability.startTime);
      const endTime = parseISO(availability.endTime);
      
      setFormData({
        recurring: availability.recurring,
        dayOfWeek: availability.dayOfWeek || 1,
        specificDate: availability.specificDate ? new Date(availability.specificDate) : new Date(),
        startTime,
        endTime,
      });
    } else {
      // Add mode
      setIsEditing(false);
      setSelectedAvailability(null);
      setFormData({
        recurring: true,
        dayOfWeek: 1,
        specificDate: new Date(),
        startTime: new Date(new Date().setHours(9, 0, 0, 0)),
        endTime: new Date(new Date().setHours(17, 0, 0, 0)),
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: '',
      });
    }
  };

  const handleRecurringChange = (event: SelectChangeEvent<string>) => {
    const recurring = event.target.value === 'true';
    setFormData({
      ...formData,
      recurring,
    });
  };

  const handleDayOfWeekChange = (event: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      dayOfWeek: event.target.value as number,
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate times
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
    
    // For specific date, validate that the date is in the future
    if (!formData.recurring && formData.specificDate) {
      const today = startOfDay(new Date());
      if (isBefore(formData.specificDate, today)) {
        errors.specificDate = 'Date must be in the future';
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (!user?.id) return;
      
      const availabilityData: Partial<Availability> = {
        providerId: user.id,
        recurring: formData.recurring,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
      };
      
      if (formData.recurring) {
        availabilityData.dayOfWeek = formData.dayOfWeek;
      } else {
        availabilityData.specificDate = format(formData.specificDate, 'yyyy-MM-dd');
      }
      
      let updatedAvailability: Availability;
      
      if (isEditing && selectedAvailability) {
        // Update existing availability
        updatedAvailability = await availabilityService.updateAvailability(
          selectedAvailability.id,
          availabilityData
        );
        
        // Update in local state
        setAvailabilities(
          availabilities.map((a) => (a.id === updatedAvailability.id ? updatedAvailability : a))
        );
        
        setSuccess('Availability updated successfully');
      } else {
        // Create new availability
        updatedAvailability = await availabilityService.createAvailability(user.id, availabilityData);
        
        // Add to local state
        setAvailabilities([...availabilities, updatedAvailability]);
        
        setSuccess('Availability added successfully');
      }
      
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save availability. Please try again later.');
      console.error(err);
    }
  };

  const handleDelete = async (availabilityId: number) => {
    try {
      await availabilityService.deleteAvailability(availabilityId);
      
      // Remove from local state
      setAvailabilities(availabilities.filter((a) => a.id !== availabilityId));
      
      setSuccess('Availability deleted successfully');
    } catch (err) {
      setError('Failed to delete availability. Please try again later.');
      console.error(err);
    }
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return format(date, 'h:mm a');
  };

  const getDayOfWeekName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getRecurringAvailabilities = () => {
    return availabilities.filter((a) => a.recurring);
  };

  const getSpecificDateAvailabilities = () => {
    return availabilities.filter((a) => !a.recurring);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your availability..." />;
  }

  const recurringAvailabilities = getRecurringAvailabilities();
  const specificDateAvailabilities = getSpecificDateAvailabilities();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Manage Availability</Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Availability
            </Button>
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Set your regular working hours or specific dates when you're available for appointments.
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 3 }}>
              {error}
            </Typography>
          )}
          
          {success && (
            <Typography color="success.main" sx={{ mb: 3 }}>
              {success}
            </Typography>
          )}
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="availability tabs">
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <RepeatIcon sx={{ mr: 1 }} />
                    <span>Weekly Schedule ({recurringAvailabilities.length})</span>
                  </Box>
                }
                id="availability-tab-0"
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventIcon sx={{ mr: 1 }} />
                    <span>Specific Dates ({specificDateAvailabilities.length})</span>
                  </Box>
                }
                id="availability-tab-1"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            {recurringAvailabilities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't set any weekly availability yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{ mt: 2 }}
                >
                  Add Weekly Availability
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const dayAvailabilities = recurringAvailabilities.filter((a) => a.dayOfWeek === day);
                  
                  return (
                    <Grid item xs={12} key={day}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderColor: dayAvailabilities.length > 0 ? 'primary.main' : 'divider',
                          borderWidth: dayAvailabilities.length > 0 ? 2 : 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{getDayOfWeekName(day)}</Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => {
                              setFormData({
                                ...formData,
                                recurring: true,
                                dayOfWeek: day,
                              });
                              handleOpenDialog();
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                        
                        {dayAvailabilities.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No availability set for this day.
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
                                borderRadius: 1,
                                bgcolor: 'background.default',
                              }}
                            >
                              <Typography>
                                {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                              </Typography>
                              <Box>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(availability)}
                                  aria-label="edit"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDelete(availability.id)}
                                  aria-label="delete"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                          ))
                        )}
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {specificDateAvailabilities.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You haven't set any specific date availability yet.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      recurring: false,
                    });
                    handleOpenDialog();
                  }}
                  sx={{ mt: 2 }}
                >
                  Add Specific Date
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {specificDateAvailabilities
                  .sort((a, b) => {
                    if (!a.specificDate || !b.specificDate) return 0;
                    return new Date(a.specificDate).getTime() - new Date(b.specificDate).getTime();
                  })
                  .map((availability) => (
                    <Grid item xs={12} sm={6} md={4} key={availability.id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6">
                            {availability.specificDate
                              ? format(new Date(availability.specificDate), 'EEEE, MMMM d, yyyy')
                              : 'Unknown Date'}
                          </Typography>
                          <Typography variant="body1">
                            {formatTime(availability.startTime)} - {formatTime(availability.endTime)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(availability)}
                            aria-label="edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(availability.id)}
                            aria-label="delete"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
              </Grid>
            )}
          </TabPanel>
        </Paper>
        
        {/* Add/Edit Availability Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {isEditing ? 'Edit Availability' : 'Add Availability'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 0 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="recurring-label">Availability Type</InputLabel>
                  <Select
                    labelId="recurring-label"
                    id="recurring"
                    value={formData.recurring.toString()}
                    label="Availability Type"
                    onChange={handleRecurringChange}
                  >
                    <MenuItem value="true">Weekly (Recurring)</MenuItem>
                    <MenuItem value="false">Specific Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {formData.recurring ? (
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                    <Select
                      labelId="day-of-week-label"
                      id="day-of-week"
                      value={formData.dayOfWeek}
                      label="Day of Week"
                      onChange={handleDayOfWeekChange}
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
                  <DatePicker
                    label="Date"
                    value={formData.specificDate}
                    onChange={(date) => handleFormChange('specificDate', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!formErrors.specificDate,
                        helperText: formErrors.specificDate,
                      },
                    }}
                  />
                </Grid>
              )}
              
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Start Time"
                  value={formData.startTime}
                  onChange={(time) => handleFormChange('startTime', time)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.startTime,
                      helperText: formErrors.startTime,
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="End Time"
                  value={formData.endTime}
                  onChange={(time) => handleFormChange('endTime', time)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!formErrors.endTime,
                      helperText: formErrors.endTime,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              {isEditing ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
};

export default ProviderAvailabilityPage;