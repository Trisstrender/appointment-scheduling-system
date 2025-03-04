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
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../api';
import { User } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ClientProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<ProfileFormData>>({});

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (authUser?.id) {
          setIsLoading(true);
          const userData = await userService.getUserById(authUser.id);
          setUser(userData);
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      } catch (err) {
        setError('Failed to load user profile. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field when user starts typing
    if (formErrors[name as keyof ProfileFormData]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    let isValid = true;

    // Validate required fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
      isValid = false;
    }

    // Validate password fields if user is trying to change password
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required to set a new password';
        isValid = false;
      }

      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
        isValid = false;
      } else if (formData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
        isValid = false;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      if (!user) return;

      // Prepare update data
      const updateData: Partial<User> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
      };

      // Only include password fields if user is changing password
      if (formData.newPassword && formData.currentPassword) {
        // In a real app, you would send the current password for verification
        // and the new password for updating
        // This is just a placeholder for the demo
        // updateData.password = formData.newPassword;
      }

      // Update user profile
      const updatedUser = await userService.updateUser(user.id, updateData);
      setUser(updatedUser);
      setSuccess('Profile updated successfully');

      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Failed to update profile. Please try again later.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccess(null);
    setError(null);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mr: 2,
            }}
          >
            {user?.firstName?.charAt(0) || ''}
            {user?.lastName?.charAt(0) || ''}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              My Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your personal information and account settings
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                disabled // Email cannot be changed
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!formErrors.phoneNumber}
                helperText={formErrors.phoneNumber}
              />
            </Grid>

            {/* Change Password */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Divider />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Leave these fields blank if you don't want to change your password
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="currentPassword"
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                error={!!formErrors.currentPassword}
                helperText={formErrors.currentPassword}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="newPassword"
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={!!formErrors.newPassword}
                helperText={formErrors.newPassword}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="confirmPassword"
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isSaving}
                sx={{ minWidth: 150 }}
              >
                {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Success/Error Alerts */}
      <Snackbar open={!!success || !!error} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
          {success || error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ClientProfilePage;