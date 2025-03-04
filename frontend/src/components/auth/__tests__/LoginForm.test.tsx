import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import LoginForm from '../LoginForm';
import { login } from '../../../redux/auth/authActions';

// Mock the LoginForm component since we're just testing the component's behavior
jest.mock('../LoginForm', () => {
  return {
    __esModule: true,
    default: (props: any) => <div data-testid="login-form-mock" {...props} />
  };
});

// Mock the auth actions
jest.mock('../../../redux/auth/authActions', () => ({
  login: jest.fn(),
}));

// Create mock store without middleware for testing
const mockStore = configureStore();

describe('LoginForm Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
      },
    });
    store.dispatch = jest.fn();
    (login as jest.Mock).mockClear();
  });

  const renderLoginForm = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
  };

  test('renders login form correctly', () => {
    renderLoginForm();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    renderLoginForm();
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Submit form without inputs
    fireEvent.click(submitButton);
    
    // Check validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // Check email validation
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
    
    // Enter valid email but short password
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    // Check password validation
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid inputs', async () => {
    renderLoginForm();
    
    // Get form elements
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Enter valid inputs
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Check if login action was dispatched with correct values
    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('displays loading state during form submission', () => {
    store = mockStore({
      auth: {
        loading: true,
        error: null,
      },
    });
    
    renderLoginForm();
    
    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  test('displays error message when login fails', () => {
    store = mockStore({
      auth: {
        loading: false,
        error: 'Invalid credentials',
      },
    });
    
    renderLoginForm();
    
    // Check if error message is displayed
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });
});