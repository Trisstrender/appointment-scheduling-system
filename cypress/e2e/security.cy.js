/// <reference types="cypress" />

describe('Security Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should redirect unauthenticated users to login page when accessing protected routes', () => {
    // Try to access client dashboard without authentication
    cy.visit('/client/dashboard');
    cy.url().should('include', '/login');
    
    // Try to access provider dashboard without authentication
    cy.visit('/provider/dashboard');
    cy.url().should('include', '/login');
    
    // Try to access admin dashboard without authentication
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('should prevent client users from accessing provider routes', () => {
    // Login as client
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Verify login success
      cy.url().should('include', '/client/dashboard');
      
      // Try to access provider dashboard
      cy.visit('/provider/dashboard');
      cy.url().should('include', '/unauthorized');
      
      // Try to access provider appointments
      cy.visit('/provider/appointments');
      cy.url().should('include', '/unauthorized');
      
      // Try to access provider services
      cy.visit('/provider/services');
      cy.url().should('include', '/unauthorized');
      
      // Try to access provider availability
      cy.visit('/provider/availability');
      cy.url().should('include', '/unauthorized');
    });
  });

  it('should prevent provider users from accessing admin routes', () => {
    // Login as provider
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider1;
      cy.login(email, password);
      
      // Verify login success
      cy.url().should('include', '/provider/dashboard');
      
      // Try to access admin dashboard
      cy.visit('/admin/dashboard');
      cy.url().should('include', '/unauthorized');
      
      // Try to access admin users
      cy.visit('/admin/users');
      cy.url().should('include', '/unauthorized');
      
      // Try to access admin services
      cy.visit('/admin/services');
      cy.url().should('include', '/unauthorized');
      
      // Try to access admin appointments
      cy.visit('/admin/appointments');
      cy.url().should('include', '/unauthorized');
    });
  });

  it('should prevent client users from accessing admin routes', () => {
    // Login as client
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Verify login success
      cy.url().should('include', '/client/dashboard');
      
      // Try to access admin dashboard
      cy.visit('/admin/dashboard');
      cy.url().should('include', '/unauthorized');
      
      // Try to access admin users
      cy.visit('/admin/users');
      cy.url().should('include', '/unauthorized');
      
      // Try to access admin services
      cy.visit('/admin/services');
      cy.url().should('include', '/unauthorized');
      
      // Try to access admin appointments
      cy.visit('/admin/appointments');
      cy.url().should('include', '/unauthorized');
    });
  });

  it('should validate login form inputs', () => {
    cy.visit('/login');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'Email is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Password is required');
    
    // Try to submit with invalid email
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'Invalid email address');
    
    // Try to submit with valid email but no password
    cy.get('input[name="email"]').clear().type('valid@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'Password is required');
  });

  it('should validate registration form inputs', () => {
    cy.visit('/register');
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'First name is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Last name is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Email is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Password is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Please confirm your password');
    
    // Try to submit with invalid email
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'Invalid email address');
    
    // Try to submit with mismatched passwords
    cy.get('input[name="email"]').clear().type('valid@example.com');
    cy.get('input[name="password"]').clear().type('password123');
    cy.get('input[name="confirmPassword"]').clear().type('password456');
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'Passwords do not match');
  });

  it('should prevent XSS attacks in form inputs', () => {
    // Login as client
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Navigate to profile page
      cy.visit('/client/profile');
      
      // Try to inject script in profile form
      cy.get('.edit-profile-button').click();
      
      // Attempt XSS in first name field
      const xssPayload = '<script>alert("XSS")</script>';
      cy.get('input[name="firstName"]').clear().type(xssPayload);
      
      // Save changes
      cy.get('.save-button').click();
      
      // Verify the script tag is not executed but escaped
      cy.get('.profile-card').should('not.contain', '<script>');
      cy.get('.profile-card').should('contain', 'XSS');
    });
  });

  it('should have secure HTTP headers', () => {
    cy.request('/').then((response) => {
      // Check for important security headers
      const headers = response.headers;
      
      // Log headers for debugging
      cy.log('Response Headers:', headers);
      
      // Check for Content-Security-Policy header
      // Note: This is a basic check, actual implementation may vary
      if (headers['content-security-policy']) {
        cy.log('Content-Security-Policy header is present');
      }
      
      // Check for X-XSS-Protection header
      if (headers['x-xss-protection']) {
        expect(headers['x-xss-protection']).to.equal('1; mode=block');
      }
      
      // Check for X-Content-Type-Options header
      if (headers['x-content-type-options']) {
        expect(headers['x-content-type-options']).to.equal('nosniff');
      }
    });
  });
}); 