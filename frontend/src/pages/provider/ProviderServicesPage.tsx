import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../../hooks/useAuth';
import { serviceService } from '../../api';
import { Service } from '../../types';
import { LoadingSpinner } from '../../components/common';

const ProviderServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [price, setPrice] = useState<number>(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchServices();
  }, [user?.id]);

  const fetchServices = async () => {
    try {
      if (user?.id) {
        setIsLoading(true);
        const response = await serviceService.getServicesByProviderId(user.id);
        
        // Map the API response to match the expected Service type
        const serviceData = response.data.data.map((item: any) => ({
          ...item,
          // Ensure required fields have default values if they're undefined
          createdAt: item.createdAt || '',
          updatedAt: item.updatedAt || '',
        }));
        
        setServices(serviceData);
      }
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description || '');
      setDurationMinutes(service.durationMinutes);
      setPrice(service.price);
      setActive(service.active);
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
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(60);
    setPrice(0);
    setActive(true);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Service name is required');
      return false;
    }
    if (durationMinutes <= 0) {
      setError('Duration must be greater than 0');
      return false;
    }
    if (price < 0) {
      setError('Price cannot be negative');
      return false;
    }
    return true;
  };

  const handleSaveService = async () => {
    try {
      if (!validateForm()) return;

      setError(null);
      
      const serviceData = {
        name,
        description,
        durationMinutes,
        price,
        active,
      };

      if (editingService) {
        // Update existing service
        await serviceService.updateService(editingService.id, serviceData);
        setSuccess('Service updated successfully');
      } else {
        // Create new service
        if (user?.id) {
          await serviceService.createService(user.id, serviceData);
          setSuccess('Service created successfully');
        }
      }

      handleCloseDialog();
      fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save service');
      console.error(err);
    }
  };

  const handleDeleteConfirmation = (service: Service) => {
    setServiceToDelete(service);
    setConfirmDeleteDialog(true);
  };

  const handleDeleteService = async () => {
    try {
      if (serviceToDelete) {
        await serviceService.deleteService(serviceToDelete.id);
        setSuccess('Service deleted successfully');
        fetchServices();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete service');
      console.error(err);
    } finally {
      setConfirmDeleteDialog(false);
      setServiceToDelete(null);
    }
  };

  const handleToggleServiceStatus = async (service: Service) => {
    try {
      if (service.active) {
        await serviceService.deactivateService(service.id);
        setSuccess('Service deactivated successfully');
      } else {
        await serviceService.activateService(service.id);
        setSuccess('Service activated successfully');
      }
      fetchServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update service status');
      console.error(err);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours} hr ${mins} min`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your services..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Manage Services
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add New Service
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Create and manage the services you offer to clients. You can set prices, durations, and descriptions.
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

      {services.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't added any services yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start by adding your first service to let clients book appointments with you.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Add Your First Service
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: service.active ? 1 : 0.7,
              }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={`https://source.unsplash.com/random/300x200/?${encodeURIComponent(service.name.toLowerCase())}`}
                  alt={service.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="div" gutterBottom>
                      {service.name}
                    </Typography>
                    <Chip 
                      label={service.active ? 'Active' : 'Inactive'} 
                      color={service.active ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                    height: '60px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {service.description || 'No description provided.'}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Duration:
                      </Typography>
                      <Typography variant="body1">
                        {formatDuration(service.durationMinutes)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Price:
                      </Typography>
                      <Typography variant="body1">
                        ${service.price.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(service)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteConfirmation(service)}
                  >
                    Delete
                  </Button>
                  <IconButton
                    size="small"
                    color={service.active ? 'default' : 'primary'}
                    onClick={() => handleToggleServiceStatus(service)}
                    sx={{ ml: 'auto' }}
                    title={service.active ? 'Deactivate' : 'Activate'}
                  >
                    {service.active ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Service Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingService ? 'Edit Service' : 'Add New Service'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Service Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Duration (minutes)"
                  fullWidth
                  required
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Price"
                  fullWidth
                  required
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Active (visible to clients)"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveService} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteDialog} onClose={() => setConfirmDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the service "{serviceToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteService} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderServicesPage;