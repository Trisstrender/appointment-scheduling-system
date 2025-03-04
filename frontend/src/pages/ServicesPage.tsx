import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { serviceService, userService } from '../api';
import { Service, User } from '../types';
import { LoadingSpinner } from '../components/common';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [providers, setProviders] = useState<User[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all active services
        const allServices = await serviceService.getAllServices(true);
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
    // Apply filters whenever search term or selected provider changes
    filterServices();
  }, [searchTerm, selectedProvider, services]);

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
    if (selectedProvider) {
      filtered = filtered.filter((service) => service.providerId.toString() === selectedProvider);
    }

    setFilteredServices(filtered);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleProviderChange = (event: SelectChangeEvent<string>) => {
    setSelectedProvider(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvider('');
    setFilteredServices(services);
  };

  // Function to get a random image for services
  const getServiceImage = (serviceId: number) => {
    const images = [
      'https://source.unsplash.com/random/300x200/?haircut',
      'https://source.unsplash.com/random/300x200/?massage',
      'https://source.unsplash.com/random/300x200/?fitness',
      'https://source.unsplash.com/random/300x200/?spa',
      'https://source.unsplash.com/random/300x200/?yoga',
      'https://source.unsplash.com/random/300x200/?dentist',
      'https://source.unsplash.com/random/300x200/?consultation',
    ];
    
    // Use the service ID to pick an image, ensuring the same service always gets the same image
    return images[serviceId % images.length];
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading services..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Available Services
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and book appointments with our service providers.
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Search Services"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Search by service name, description, or provider"
            />
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="provider-filter-label">Filter by Provider</InputLabel>
              <Select
                labelId="provider-filter-label"
                id="provider-filter"
                value={selectedProvider}
                label="Filter by Provider"
                onChange={handleProviderChange}
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
          <Grid item xs={12} md={2}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={clearFilters}
              disabled={!searchTerm && !selectedProvider}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Error message */}
      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No services found matching your criteria.
          </Typography>
          <Button variant="text" color="primary" onClick={clearFilters} sx={{ mt: 2 }}>
            Clear Filters
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredServices.map((service) => (
            <Grid item key={service.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={getServiceImage(service.id)}
                  alt={service.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {service.name}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    by {service.providerName}
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
                    component={RouterLink}
                    to={`/services/${service.id}`}
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ServicesPage;