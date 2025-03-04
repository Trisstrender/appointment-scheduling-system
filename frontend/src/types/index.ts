// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  userType: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Client extends User {
  userType: 'CLIENT';
}

export interface Provider extends User {
  userType: 'PROVIDER';
  title?: string;
  description?: string;
}

export interface Admin extends User {
  userType: 'ADMIN';
  superAdmin: boolean;
}

// Service types
export interface Service {
  id: number;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  providerId: number;
  providerName?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Availability types
export interface Availability {
  id: number;
  providerId: number;
  providerName?: string;
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  recurring: boolean;
  specificDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Appointment types
export interface Appointment {
  id: number;
  clientId: number;
  clientName?: string;
  providerId: number;
  providerName?: string;
  serviceId: number;
  serviceName?: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  title?: string;
  description?: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: number;
  email: string;
  role: string;
  userType: string;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}