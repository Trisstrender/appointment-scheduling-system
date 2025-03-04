import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useDispatch, useSelector, AnyAction } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { register } from '../../redux/auth/authActions';
import { RootState } from '../../redux/store';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: string;
}

const RegisterForm: React.FC = () => {
  const dispatch = useDispatch<ThunkDispatch<RootState, unknown, AnyAction>>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formValues, setFormValues] = useState<RegisterFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<RegisterFormValues>>({});
  
  const validateForm = (): boolean => {
    const errors: Partial<RegisterFormValues> = {};
    let isValid = true;
    
    if (!formValues.firstName) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    
    if (!formValues.lastName) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
    
    if (!formValues.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    if (!formValues.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formValues.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!formValues.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formValues.password !== formValues.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    if (!formValues.userType) {
      errors.userType = 'Please select a user type';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    
    // Clear error when user types
    if (formErrors[name as keyof RegisterFormValues]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const handleUserTypeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setFormValues({
      ...formValues,
      userType: value,
    });
    
    // Clear error when user selects
    if (formErrors.userType) {
      setFormErrors({
        ...formErrors,
        userType: '',
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      const { confirmPassword, ...registerData } = formValues;
      dispatch(register(registerData));
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
        <PersonAddIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Sign up
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
          {error}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              autoFocus
              value={formValues.firstName}
              onChange={handleChange}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              disabled={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={formValues.lastName}
              onChange={handleChange}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              disabled={loading}
            />
          </Grid>
        </Grid>
        
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={formValues.email}
          onChange={handleChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="new-password"
          value={formValues.password}
          onChange={handleChange}
          error={!!formErrors.password}
          helperText={formErrors.password}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          autoComplete="new-password"
          value={formValues.confirmPassword}
          onChange={handleChange}
          error={!!formErrors.confirmPassword}
          helperText={formErrors.confirmPassword}
          disabled={loading}
        />
        
        <FormControl 
          fullWidth 
          margin="normal" 
          error={!!formErrors.userType}
          disabled={loading}
        >
          <InputLabel id="user-type-label">I am a</InputLabel>
          <Select
            labelId="user-type-label"
            id="userType"
            name="userType"
            value={formValues.userType}
            label="I am a"
            onChange={handleUserTypeChange}
          >
            <MenuItem value="CLIENT">Client</MenuItem>
            <MenuItem value="PROVIDER">Service Provider</MenuItem>
          </Select>
          {formErrors.userType && (
            <FormHelperText>{formErrors.userType}</FormHelperText>
          )}
        </FormControl>
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign Up'}
        </Button>
        
        <Grid container justifyContent="flex-end">
          <Grid item>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default RegisterForm;