import { Dispatch } from 'redux';
import { authService } from '../../api';
import { AuthActionTypes } from './authTypes';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string;
}

// Login action
export const login = (credentials: LoginCredentials) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: AuthActionTypes.AUTH_REQUEST });
    
    const response = await authService.login(credentials);
    
    dispatch({
      type: AuthActionTypes.LOGIN_SUCCESS,
      payload: response.data.data,
    });
    
    localStorage.setItem('token', response.data.data.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.data));
    
    return true;
  } catch (error: any) {
    dispatch({
      type: AuthActionTypes.AUTH_FAILURE,
      payload: error.response?.data?.message || 'Login failed. Please try again.',
    });
    
    return false;
  }
};

// Register action
export const register = (userData: RegisterData) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: AuthActionTypes.AUTH_REQUEST });
    
    const response = await authService.register(userData);
    
    dispatch({
      type: AuthActionTypes.REGISTER_SUCCESS,
      payload: response.data.data,
    });
    
    return true;
  } catch (error: any) {
    dispatch({
      type: AuthActionTypes.AUTH_FAILURE,
      payload: error.response?.data?.message || 'Registration failed. Please try again.',
    });
    
    return false;
  }
};

// Logout action
export const logout = () => (dispatch: Dispatch) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  dispatch({ type: AuthActionTypes.LOGOUT });
};

// Clear error action
export const clearAuthError = () => (dispatch: Dispatch) => {
  dispatch({ type: AuthActionTypes.CLEAR_AUTH_ERROR });
};

// Load user from localStorage
export const loadUser = () => (dispatch: Dispatch) => {
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      dispatch({
        type: AuthActionTypes.LOAD_USER,
        payload: JSON.parse(user),
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error loading user from localStorage:', error);
    return false;
  }
};