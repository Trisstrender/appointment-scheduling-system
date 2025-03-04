import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertMessage from '../AlertMessage';

describe('AlertMessage Component', () => {
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    mockOnClose.mockClear();
  });
  
  test('renders success alert with title and message', () => {
    render(
      <AlertMessage
        open={true}
        onClose={mockOnClose}
        severity="success"
        title="Success Title"
        message="Success message content"
      />
    );
    
    // Check if alert is rendered with correct severity
    const alert = screen.getByTestId('alert-success');
    expect(alert).toBeInTheDocument();
    
    // Check if title and message are displayed
    expect(screen.getByText('Success Title')).toBeInTheDocument();
    expect(screen.getByText('Success message content')).toBeInTheDocument();
  });
  
  test('renders error alert without title', () => {
    render(
      <AlertMessage
        open={true}
        onClose={mockOnClose}
        severity="error"
        message="Error message content"
      />
    );
    
    // Check if alert is rendered with correct severity
    const alert = screen.getByTestId('alert-error');
    expect(alert).toBeInTheDocument();
    
    // Check if message is displayed
    expect(screen.getByText('Error message content')).toBeInTheDocument();
  });
  
  test('does not render when open is false', () => {
    render(
      <AlertMessage
        open={false}
        onClose={mockOnClose}
        severity="info"
        message="Info message content"
      />
    );
    
    // Alert should not be visible
    expect(screen.queryByTestId('alert-info')).not.toBeInTheDocument();
  });
  
  test('calls onClose when close button is clicked', () => {
    render(
      <AlertMessage
        open={true}
        onClose={mockOnClose}
        severity="warning"
        message="Warning message content"
      />
    );
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  test('renders with custom autoHideDuration', () => {
    render(
      <AlertMessage
        open={true}
        onClose={mockOnClose}
        severity="info"
        message="Info message"
        autoHideDuration={10000}
      />
    );
    
    // We can't directly test the autoHideDuration prop, but we can verify the component renders
    expect(screen.getByTestId('alert-snackbar')).toBeInTheDocument();
  });
});