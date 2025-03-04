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
  ProviderDashboardPage,
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
                <Route path="client/appointments" element={<div>Client Appointments (Coming Soon)</div>} />
                <Route path="client/profile" element={<div>Client Profile (Coming Soon)</div>} />
              </Route>

              {/* Protected provider routes */}
              <Route element={<ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']} />}>
                <Route path="provider/dashboard" element={<ProviderDashboardPage />} />
                <Route path="provider/appointments" element={<div>Provider Appointments (Coming Soon)</div>} />
                <Route path="provider/services" element={<div>Provider Services (Coming Soon)</div>} />
                <Route path="provider/availability" element={<div>Provider Availability (Coming Soon)</div>} />
                <Route path="provider/profile" element={<div>Provider Profile (Coming Soon)</div>} />
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
