// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Other global configuration
export const APP_NAME = 'Appointment Scheduling System';
export const APP_VERSION = '1.0.0';

// Feature flags
export const FEATURES = {
  DARK_MODE: true,
  NOTIFICATIONS: true,
};

// Date format configuration
export const DATE_FORMAT = 'MMM d, yyyy';
export const TIME_FORMAT = 'h:mm a';
export const DATE_TIME_FORMAT = 'MMM d, yyyy h:mm a';