import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Check if spinner is rendered
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Check if default message is displayed
    expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    expect(screen.getByTestId('loading-message')).toHaveTextContent('Loading...');
    
    // Check if CircularProgress is rendered
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('renders with custom message', () => {
    const customMessage = 'Custom loading message';
    render(<LoadingSpinner message={customMessage} />);
    
    // Check if custom message is displayed
    expect(screen.getByTestId('loading-message')).toHaveTextContent(customMessage);
  });
  
  test('renders with custom size', () => {
    const customSize = 60;
    render(<LoadingSpinner size={customSize} />);
    
    // CircularProgress should be rendered with custom size
    // Note: We can't directly test the size prop, but we can verify the component renders
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
  
  test('does not render message when message prop is empty', () => {
    render(<LoadingSpinner message="" />);
    
    // Message element should not be in the document
    expect(screen.queryByTestId('loading-message')).not.toBeInTheDocument();
  });
});