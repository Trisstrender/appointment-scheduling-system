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
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { serviceService, userService } from '../../api';
import { Service, User } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface ServiceFormData {
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  providerId: number;
  active: boolean;
}

const AdminServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<User[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    durationMinutes: 60,
    price: 0,
    providerId: 0,
    active: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all services
        const allServices = await serviceService.getAllServices();
        setServices(allServices);
        setFilteredServices(allServices);
        
        // Fetch all providers
        const allProviders = await userService.getAllProviders();
        setProviders(allProviders);
      } catch (err) {
        setError('Failed to load services. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters whenever search term, provider filter, or status filter changes
    filterServices();
  }, [searchTerm, providerFilter, statusFilter, services]);

  const filterServices = () => {
    let filtered = [...services];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(term) ||
          (service.description && service.description.toLowerCase().includes(term)) ||
          (service.providerName && service.providerName.toLowerCase().includes(term))
      );
    }

    // Filter by provider
    if (providerFilter) {
      filtered = filtered.filter((service) => service.providerId.toString() === providerFilter);
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      const isActive = statusFilter === 'ACTIVE';
      filtered = filtered.filter((service) => service.active === isActive);
    }

    setFilteredServices(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleProviderFilterChange = (event: SelectChangeEvent<string>) => {
    setProviderFilter(event.target.value);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      durationMinutes: service.durationMinutes,
      price: service.price,
      providerId: service.providerId,
      active: service.active,
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedService(null);
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

  const handleProviderChange = (event: SelectChangeEvent<number>) => {
    setFormData({
      ...formData,
      providerId: event.target.value as number,
    });
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
    
    if (!formData.providerId) {
      errors.providerId = 'Provider is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleUpdateService = async () => {
    if (!validateForm() || !selectedService) {
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const serviceData: Partial<Service> = {
        name: formData.name,
        description: formData.description,
        durationMinutes: formData.durationMinutes,
        price: formData.price,
        providerId: formData.providerId,
        active: formData.active,
      };
      
      const updatedService = await serviceService.updateService(selectedService.id, serviceData);
      
      // Update in local state
      setServices(
        services.map((s) => (s.id === updatedService.id ? updatedService : s))
      );
      
      setSuccess('Service updated successfully');
      handleCloseEditDialog();
    } catch (err) {
      setError('Failed to update service. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async () => {
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

  const handleToggleServiceStatus = async (service: Service) => {
    try {
      if (service.active) {
        await serviceService.deactivateService(service.id);
      } else {
        await serviceService.activateService(service.id);
      }
      
      // Update in local state
      const updatedService = { ...service, active: !service.active };
      setServices(
        services.map((s) => (s.id === service.id ? updatedService : s))
      );
      
      setSuccess(`Service ${service.active ? 'deactivated' : 'activated'} successfully`);
    } catch (err) {
      setError(`Failed to ${service.active ? 'deactivate' : 'activate'} service. Please try again later.`);
      console.error(err);
    }
  };

  const handleAlertClose = () => {
    setSuccess(null);
    setError(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setProviderFilter('');
    setStatusFilter('ALL');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading services..." />;
  }

  // Get current page of services
  const currentServices = filteredServices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Service Management
        </Typography>
        
        {/* Filters */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            label="Search Services"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: '200px' }}>
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
          
          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            onClick={clearFilters}
            disabled={!searchTerm && !providerFilter && statusFilter === 'ALL'}
          >
            Clear Filters
          </Button>
        </Box>
        
        {/* Success/Error Alerts */}
        <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleAlertClose}>
          <Alert onClose={handleAlertClose} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
            {success || error}
          </Alert>
        </Snackbar>
        
        {/* Services Table */}
        {filteredServices.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No services found matching your criteria.
            </Typography>
            {(searchTerm || providerFilter || statusFilter !== 'ALL') && (
              <Button variant="text" color="primary" onClick={clearFilters} sx={{ mt: 2 }}>
                Clear Filters
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 650 }} aria-label="services table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentServices.map((service) => (
                    <TableRow key={service.id} hover>
                      <TableCell>{service.name}</TableCell>
                      <TableCell>{service.providerName}</TableCell>
                      <TableCell>{service.durationMinutes} min</TableCell>
                      <TableCell>${service.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={service.active ? 'Active' : 'Inactive'}
                          color={service.active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(service)}
                          aria-label="edit service"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color={service.active ? 'error' : 'success'}
                          onClick={() => handleToggleServiceStatus(service)}
                          aria-label={service.active ? 'deactivate service' : 'activate service'}
                          size="small"
                        >
                          {service.active ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteDialog(service)}
                          aria-label="delete service"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredServices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
      
      {/* Edit Service Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Service</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
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
                rows={3}
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
            <Grid item xs={12} sm={6}>
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
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button
            onClick={handleUpdateService}
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : 'Save Changes'}
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
          <Button onClick={handleDeleteService} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminServicesPage;