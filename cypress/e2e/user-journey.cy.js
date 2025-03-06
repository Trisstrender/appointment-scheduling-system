/// <reference types="cypress" />

describe('Complete User Journey', () => {
  const uniqueId = Date.now().toString();
  const newUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `testuser${uniqueId}@example.com`,
    password: 'password123',
    userType: 'CLIENT'
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow a new user to register, login, book an appointment, and receive notifications', () => {
    // Step 1: Register a new user
    cy.visit('/register');
    cy.get('input[name="firstName"]').type(newUser.firstName);
    cy.get('input[name="lastName"]').type(newUser.lastName);
    cy.get('input[name="email"]').type(newUser.email);
    cy.get('input[name="password"]').type(newUser.password);
    cy.get('input[name="confirmPassword"]').type(newUser.password);
    cy.get('#userType').click();
    cy.get(`[data-value="${newUser.userType}"]`).click();
    cy.get('button[type="submit"]').click();

    // Verify registration success
    cy.url().should('include', '/login');
    cy.get('.MuiAlert-root').should('contain', 'Registration successful');

    // Step 2: Login with the new account
    cy.get('input[name="email"]').type(newUser.email);
    cy.get('input[name="password"]').type(newUser.password);
    cy.get('button[type="submit"]').click();

    // Verify login success and redirect to dashboard
    cy.url().should('include', '/client/dashboard');
    cy.get('h1').should('contain', 'Dashboard');

    // Step 3: Navigate to services page
    cy.get('[data-testid="book-appointment-button"]').click();
    cy.url().should('include', '/services');

    // Step 4: Select a service
    cy.get('.service-card').first().click();
    cy.get('.service-details').should('be.visible');

    // Step 5: Book an appointment
    cy.get('.book-button').click();
    cy.url().should('include', '/booking');

    // Select a date (first available)
    cy.get('.available-date').first().click();
    
    // Select a time slot (first available)
    cy.get('.available-slot').first().click();
    
    // Confirm booking
    cy.get('.confirm-booking-button').click();
    
    // Verify success message
    cy.get('.success-message').should('contain', 'Appointment booked successfully');
    
    // Step 6: Check for notifications
    // Wait for notification to appear
    cy.wait(1000);
    
    // Check notification bell
    cy.get('[data-testid="notifications-icon"]').should('be.visible');
    cy.get('.MuiBadge-badge').should('be.visible');
    
    // Open notification dropdown
    cy.openNotificationDropdown();
    
    // Verify notification content
    cy.get('[data-testid="notification-item"]').first().should('contain', 'Appointment Confirmed');
    
    // Step 7: Navigate to appointments page
    cy.visit('/client/appointments');
    
    // Verify appointment is listed
    cy.get('.appointment-card').should('have.length.at.least', 1);
    
    // Step 8: View appointment details
    cy.get('.appointment-card').first().find('button').contains('Details').click();
    
    // Verify appointment details
    cy.get('.appointment-details').should('be.visible');
    
    // Step 9: Return to dashboard
    cy.visit('/client/dashboard');
    
    // Check notifications widget
    cy.checkNotificationsWidget();
    
    // Step 10: Logout
    cy.get('[aria-label="account of current user"]').click();
    cy.get('[data-testid="logout-button"]').click();
    
    // Verify logout success
    cy.url().should('include', '/login');
  });

  it('should allow a provider to manage appointments and send notifications', () => {
    // Login as provider
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider1;
      cy.login(email, password);
      
      // Verify login success
      cy.url().should('include', '/provider/dashboard');
      
      // Navigate to appointments page
      cy.get('[data-testid="view-appointments-button"]').click();
      cy.url().should('include', '/provider/appointments');
      
      // Check for appointments
      cy.get('.appointment-card').should('have.length.at.least', 1);
      
      // Update appointment status (if any pending appointments)
      cy.get('.appointment-card').first().within(() => {
        cy.get('.appointment-status').then(($status) => {
          if ($status.text().includes('PENDING')) {
            cy.get('.update-status-button').click();
            
            // Select "CONFIRMED" status
            cy.get('.status-select').click();
            cy.get('.status-option').contains('CONFIRMED').click();
            
            // Confirm status update
            cy.get('.confirm-update-button').click();
            
            // Verify success message
            cy.get('.success-message').should('contain', 'Appointment status updated');
          }
        });
      });
      
      // Check for notifications
      cy.get('[data-testid="notifications-icon"]').should('be.visible');
      
      // Open notification dropdown
      cy.openNotificationDropdown();
      
      // Verify notifications are present
      cy.get('[data-testid="notification-item"]').should('have.length.at.least', 1);
      
      // Navigate to availability page
      cy.visit('/provider/availability');
      
      // Check if availability calendar is displayed
      cy.get('.availability-calendar').should('be.visible');
      
      // Logout
      cy.get('[aria-label="account of current user"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Verify logout success
      cy.url().should('include', '/login');
    });
  });

  it('should allow an admin to manage users, services, and appointments', () => {
    // Login as admin
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      
      // Verify login success
      cy.url().should('include', '/admin/dashboard');
      
      // Check system statistics
      cy.get('.system-stats').should('be.visible');
      
      // Navigate to users page
      cy.get('[data-testid="manage-users-button"]').click();
      cy.url().should('include', '/admin/users');
      
      // Check if users are listed
      cy.get('.user-row').should('have.length.at.least', 3);
      
      // Search for the newly created user
      cy.get('input[placeholder="Search users..."]').type(newUser.email);
      cy.get('.search-button').click();
      
      // Verify user is found
      cy.get('.user-row').should('contain', newUser.email);
      
      // Navigate to services page
      cy.visit('/admin/services');
      
      // Check if services are listed
      cy.get('.service-row').should('have.length.at.least', 1);
      
      // Navigate to appointments page
      cy.visit('/admin/appointments');
      
      // Check if appointments are listed
      cy.get('.appointment-row').should('have.length.at.least', 1);
      
      // Check notifications
      cy.checkNotificationsWidget();
      
      // Logout
      cy.get('[aria-label="account of current user"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Verify logout success
      cy.url().should('include', '/login');
    });
  });
}); 