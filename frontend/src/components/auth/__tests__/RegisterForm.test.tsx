import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import RegisterForm from '../RegisterForm';
import { register } from '../../../redux/auth/authActions';

// Mock the RegisterForm component since we're just testing the component's behavior
jest.mock('../RegisterForm', () => {
  return {
    __esModule: true,
    default: (props: any) => <div data-testid="register-form-mock" {...props} />
  };
});

// Mock the auth actions
jest.mock('../../../redux/auth/authActions', () => ({
  register: jest.fn(),
}));

// Create mock store without middleware for testing
const mockStore = configureStore();

describe('RegisterForm Component', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore({
      auth: {
        loading: false,
        error: null,
      },
    });
    store.dispatch = jest.fn();
    (register as jest.Mock).mockClear();
  });

  const renderRegisterForm = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <RegisterForm />
        </BrowserRouter>
      </Provider>
    );
  };

  test('renders register form correctly', () => {
    renderRegisterForm();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  test('validates form inputs', async () => {
    renderRegisterForm();
    
    // Get form elements
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Submit form without inputs
    fireEvent.click(submitButton);
    
    // Check validation messages
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      expect(screen.getByText(/please select a user type/i)).toBeInTheDocument();
    });
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);
    
    // Check email validation
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
    
    // Enter short password
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);
    
    // Check password validation
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    // Enter mismatched passwords
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(submitButton);
    
    // Check password match validation
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('submits form with valid inputs', async () => {
    renderRegisterForm();
    
    // Get form elements
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const userTypeSelect = screen.getByLabelText(/i am a/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Enter valid inputs
    fireEvent.change(firstNameInput, { target: { value: 'John' } });
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(userTypeSelect, { target: { value: 'CLIENT' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Check if register action was dispatched with correct values
    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        userType: 'CLIENT',
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
    
    renderRegisterForm();
    
    // Check if loading indicator is displayed
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeDisabled();
  });

  test('displays error message when registration fails', () => {
    store = mockStore({
      auth: {
        loading: false,
        error: 'Email already in use',
      },
    });
    
    renderRegisterForm();
    
    // Check if error message is displayed
    expect(screen.getByText(/email already in use/i)).toBeInTheDocument();
  });
});