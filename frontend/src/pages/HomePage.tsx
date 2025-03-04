import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PeopleIcon from '@mui/icons-material/People';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const features = [
  {
    icon: <EventAvailableIcon fontSize="large" color="primary" />,
    title: 'Easy Scheduling',
    description: 'Book appointments with your preferred service providers in just a few clicks.',
  },
  {
    icon: <PeopleIcon fontSize="large" color="primary" />,
    title: 'Find Providers',
    description: 'Discover qualified service providers in your area with detailed profiles and reviews.',
  },
  {
    icon: <BusinessCenterIcon fontSize="large" color="primary" />,
    title: 'Manage Your Business',
    description: 'Service providers can manage their availability, services, and client appointments efficiently.',
  },
];

const services = [
  {
    id: 1,
    title: 'Hair Styling',
    description: 'Professional hair styling services including cuts, coloring, and styling.',
    image: 'https://source.unsplash.com/random/300x200/?haircut',
  },
  {
    id: 2,
    title: 'Massage Therapy',
    description: 'Relaxing massage therapy sessions to help you unwind and relieve stress.',
    image: 'https://source.unsplash.com/random/300x200/?massage',
  },
  {
    id: 3,
    title: 'Fitness Training',
    description: 'Personalized fitness training sessions to help you achieve your health goals.',
    image: 'https://source.unsplash.com/random/300x200/?fitness',
  },
];

const HomePage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: { xs: 0, sm: 2 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Book Your Appointments with Ease
              </Typography>
              <Typography variant="h5" paragraph>
                Schedule services with your favorite providers in just a few clicks.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  component={RouterLink}
                  to="/services"
                  variant="contained"
                  color="secondary"
                  size="large"
                  sx={{ mr: 2, mb: 2 }}
                >
                  Browse Services
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  color="inherit"
                  size="large"
                  sx={{ mb: 2 }}
                >
                  Sign Up
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="https://source.unsplash.com/random/600x400/?appointment"
                alt="Appointment Scheduling"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Why Choose Us
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                {feature.icon}
                <Typography variant="h5" component="h3" sx={{ mt: 2, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Popular Services Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" gutterBottom>
            Popular Services
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia component="img" height="200" image={service.image} alt={service.title} />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {service.title}
                    </Typography>
                    <Typography>{service.description}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" component={RouterLink} to={`/services?category=${service.title}`}>
                      Browse Providers
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button component={RouterLink} to="/services" variant="contained" size="large">
              View All Services
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h3" component="h2" gutterBottom>
          Ready to Get Started?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Join thousands of users who are already enjoying the convenience of our appointment scheduling system.
        </Typography>
        <Button component={RouterLink} to="/register" variant="contained" size="large" sx={{ mt: 2 }}>
          Create an Account
        </Button>
      </Container>
    </Box>
  );
};

export default HomePage;