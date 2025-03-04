import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { store } from './store';
import { MainLayout } from './components/layout';
import { ProtectedRoute } from './components/common';
import {
  HomePage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  UnauthorizedPage,
  ServicesPage,
  ServiceDetailsPage,
  ClientDashboardPage,
  ClientAppointmentsPage,
  ClientProfilePage,
  ProviderDashboardPage,
  ProviderAppointmentsPage,
  ProviderProfilePage,
  ProviderAvailabilityPage,
  ProviderServicesPage,
  AdminDashboardPage,
} from './pages';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="services/:id" element={<ServiceDetailsPage />} />

              {/* Protected client routes */}
              <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']} />}>
                <Route path="client/dashboard" element={<ClientDashboardPage />} />
                <Route path="client/appointments" element={<ClientAppointmentsPage />} />
                <Route path="client/profile" element={<ClientProfilePage />} />
              </Route>

              {/* Protected provider routes */}
              <Route element={<ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']} />}>
                <Route path="provider/dashboard" element={<ProviderDashboardPage />} />
                <Route path="provider/appointments" element={<ProviderAppointmentsPage />} />
                <Route path="provider/services" element={<ProviderServicesPage />} />
                <Route path="provider/availability" element={<ProviderAvailabilityPage />} />
                <Route path="provider/profile" element={<ProviderProfilePage />} />
              </Route>

              {/* Protected admin routes */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="admin/users" element={<div>Admin Users (Coming Soon)</div>} />
                <Route path="admin/services" element={<div>Admin Services (Coming Soon)</div>} />
                <Route path="admin/appointments" element={<div>Admin Appointments (Coming Soon)</div>} />
              </Route>

              {/* Catch all route */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
