import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { serviceService } from '../../api';
import { Service } from '../../types';
import { LoadingSpinner } from '../../components/common';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface ServiceFormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  active: boolean;
}

const ProviderServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    durationMinutes: 60,
    price: 0,
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        if (user?.id) {
          setIsLoading(true);
          const providerServices = await serviceService.getServicesByProviderId(user.id);
          setServices(providerServices);
        }
      } catch (err) {
        setError('Failed to load services. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [user?.id]);

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      // Edit mode
      setIsEditing(true);
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        durationMinutes: service.durationMinutes,
        price: service.price,
        active: service.active,
      });
    } else {
      // Add mode
      setIsEditing(false);
      setSelectedService(null);
      setFormData({
        name: '',
        description: '',
        durationMinutes: 60,
        price: 0,
        active: true,
      });
    }
    
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenDeleteDialog = (service: Service) => {
    setSelectedService(service);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedService(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'durationMinutes' || name === 'price' ? parseFloat(value) : value,
    });
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };

  const handleActiveChange = (event: SelectChangeEvent<string>) => {
    setFormData({
      ...formData,
      active: event.target.value === 'true',
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    // Validate required fields
    if (!formData.name.trim()) {
      errors.name = 'Service name is required';
      isValid = false;
    }
    
    if (formData.durationMinutes <= 0) {
      errors.durationMinutes = 'Duration must be greater than 0';
      isValid = false;
    }
    
    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      if (!user?.id) return;
      
      const serviceData: Partial<Service> = {
        providerId: user.id,
        name: formData.name,
        description: formData.description,
        durationMinutes: formData.durationMinutes,
        price: formData.price,
        active: formData.active,
      };
      
      let updatedService: Service;
      
      if (isEditing && selectedService) {
        // Update existing service
        updatedService = await serviceService.updateService(selectedService.id, serviceData);
        
        // Update in local state
        setServices(
          services.map((s) => (s.id === updatedService.id ? updatedService : s))
        );
        
        setSuccess('Service updated successfully');
      } else {
        // Create new service
        updatedService = await serviceService.createService(user.id, serviceData);
        
        // Add to local state
        setServices([...services, updatedService]);
        
        setSuccess('Service added successfully');
      }
      
      handleCloseDialog();
    } catch (err) {
      setError('Failed to save service. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    
    try {
      await serviceService.deleteService(selectedService.id);
      
      // Remove from local state
      setServices(services.filter((s) => s.id !== selectedService.id));
      
      setSuccess('Service deleted successfully');
      handleCloseDeleteDialog();
    } catch (err) {
      setError('Failed to delete service. Please try again later.');
      console.error(err);
      handleCloseDeleteDialog();
    }
  };

  const handleAlertClose = () => {
    setSuccess(null);
    setError(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your services..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Manage Services</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Service
          </Button>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Create and manage the services you offer to clients.
        </Typography>
        
        {/* Success/Error Alerts */}
        <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleAlertClose}>
          <Alert onClose={handleAlertClose} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
            {success || error}
          </Alert>
        </Snackbar>
        
        {/* Services List */}
        {services.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't added any services yet.
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
          </Box>
        ) : (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    opacity: service.active ? 1 : 0.7,
                    position: 'relative',
                  }}
                >
                  {!service.active && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        bgcolor: 'error.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      Inactive
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom>
                      {service.name}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '3em' }}>
                      {service.description
                        ? service.description.length > 100
                          ? `${service.description.substring(0, 100)}...`
                          : service.description
                        : 'No description available.'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">{service.durationMinutes} min</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                          <Typography variant="body2">${service.price.toFixed(2)}</Typography>
                        </Box>
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
                      onClick={() => handleOpenDeleteDialog(service)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
      
      {/* Add/Edit Service Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Service' : 'Add Service'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                name="name"
                label="Service Name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="durationMinutes"
                name="durationMinutes"
                label="Duration (minutes)"
                type="number"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                error={!!formErrors.durationMinutes}
                helperText={formErrors.durationMinutes}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeIcon />
                    </InputAdornment>
                  ),
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="price"
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                }}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="active-label">Status</InputLabel>
                <Select
                  labelId="active-label"
                  id="active"
                  value={formData.active.toString()}
                  label="Status"
                  onChange={handleActiveChange}
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Delete Service</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the service "{selectedService?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderServicesPage;