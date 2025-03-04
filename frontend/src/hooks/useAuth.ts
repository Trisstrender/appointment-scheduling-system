import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { login, logout, register, clearError } from '../store/slices/authSlice';
import { LoginRequest, RegisterRequest } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const loginUser = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await dispatch(login(credentials)).unwrap();
        return true;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const registerUser = useCallback(
    async (userData: RegisterRequest) => {
      try {
        await dispatch(register(userData)).unwrap();
        return true;
      } catch (error) {
        return false;
      }
    },
    [dispatch]
  );

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    clearError: clearAuthError,
  };
};