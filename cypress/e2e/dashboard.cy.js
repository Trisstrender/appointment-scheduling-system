/// <reference types="cypress" />

describe('Dashboard Functionality', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should display client dashboard correctly', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/dashboard');
      
      // Check if dashboard loads correctly
      cy.get('h1').should('contain', 'Client Dashboard');
      
      // Verify dashboard components are displayed
      cy.get('[data-testid="upcoming-appointments-widget"]').should('be.visible');
      cy.get('[data-testid="quick-actions-widget"]').should('be.visible');
      cy.get('[data-testid="recent-services-widget"]').should('be.visible');
    });
  });

  it('should allow client to navigate to different sections from dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/dashboard');
      
      // Navigate to appointments
      cy.get('[data-testid="view-appointments-button"]').click();
      cy.url().should('include', '/client/appointments');
      cy.go('back');
      
      // Navigate to book appointment
      cy.get('[data-testid="book-appointment-button"]').click();
      cy.url().should('include', '/services');
      cy.go('back');
      
      // Navigate to profile
      cy.get('[data-testid="view-profile-button"]').click();
      cy.url().should('include', '/client/profile');
    });
  });

  it('should display provider dashboard correctly', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/dashboard');
      
      // Check if dashboard loads correctly
      cy.get('h1').should('contain', 'Provider Dashboard');
      
      // Verify dashboard components are displayed
      cy.get('[data-testid="today-appointments-widget"]').should('be.visible');
      cy.get('[data-testid="availability-summary-widget"]').should('be.visible');
      cy.get('[data-testid="services-summary-widget"]').should('be.visible');
      cy.get('[data-testid="quick-actions-widget"]').should('be.visible');
    });
  });

  it('should allow provider to navigate to different sections from dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/dashboard');
      
      // Navigate to appointments
      cy.get('[data-testid="view-appointments-button"]').click();
      cy.url().should('include', '/provider/appointments');
      cy.go('back');
      
      // Navigate to availability
      cy.get('[data-testid="manage-availability-button"]').click();
      cy.url().should('include', '/provider/availability');
      cy.go('back');
      
      // Navigate to services
      cy.get('[data-testid="manage-services-button"]').click();
      cy.url().should('include', '/provider/services');
    });
  });

  it('should display admin dashboard correctly', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/dashboard');
      
      // Check if dashboard loads correctly
      cy.get('h1').should('contain', 'Admin Dashboard');
      
      // Verify dashboard components are displayed
      cy.get('[data-testid="system-stats-widget"]').should('be.visible');
      cy.get('[data-testid="recent-appointments-widget"]').should('be.visible');
      cy.get('[data-testid="user-stats-widget"]').should('be.visible');
      cy.get('[data-testid="quick-actions-widget"]').should('be.visible');
    });
  });

  it('should allow admin to navigate to different sections from dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/dashboard');
      
      // Navigate to users
      cy.get('[data-testid="manage-users-button"]').click();
      cy.url().should('include', '/admin/users');
      cy.go('back');
      
      // Navigate to appointments
      cy.get('[data-testid="manage-appointments-button"]').click();
      cy.url().should('include', '/admin/appointments');
      cy.go('back');
      
      // Navigate to services
      cy.get('[data-testid="manage-services-button"]').click();
      cy.url().should('include', '/admin/services');
    });
  });

  it('should display real-time updates on dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/dashboard');
      
      // Check initial appointment count
      cy.get('[data-testid="today-appointments-count"]').then(($count) => {
        const initialCount = parseInt($count.text());
        
        // Create a new appointment (this would typically be done by a client)
        // For testing purposes, we'll simulate this by directly calling the API
        // In a real scenario, we would use a different user to create an appointment
        cy.window().then((win) => {
          // Access the Redux store to dispatch an action
          // This is a simplified example - in a real test, you might need to use a different approach
          win.dispatchTestEvent('NEW_APPOINTMENT_CREATED');
          
          // Wait for the dashboard to update
          cy.wait(1000);
          
          // Verify the appointment count has increased
          cy.get('[data-testid="today-appointments-count"]').should(($newCount) => {
            expect(parseInt($newCount.text())).to.equal(initialCount + 1);
          });
        });
      });
    });
  });

  it('should display notifications on dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/dashboard');
      
      // Check if notifications are displayed
      cy.get('[data-testid="notifications-widget"]').should('be.visible');
      
      // Click on notifications icon
      cy.get('[data-testid="notifications-icon"]').click();
      
      // Verify notifications dropdown is displayed
      cy.get('[data-testid="notifications-dropdown"]').should('be.visible');
      
      // Mark a notification as read
      cy.get('[data-testid="notification-item"]').first().click();
      
      // Verify notification is marked as read
      cy.get('[data-testid="notification-item"].read').should('have.length.at.least', 1);
    });
  });

  it('should display analytics on admin dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/dashboard');
      
      // Check if analytics section is displayed
      cy.get('[data-testid="analytics-section"]').should('be.visible');
      
      // Verify charts are displayed
      cy.get('[data-testid="appointments-chart"]').should('be.visible');
      cy.get('[data-testid="users-chart"]').should('be.visible');
      cy.get('[data-testid="revenue-chart"]').should('be.visible');
      
      // Change time period
      cy.get('[data-testid="time-period-selector"]').click();
      cy.get('[data-value="month"]').click();
      
      // Verify charts are updated
      cy.get('[data-testid="chart-loading-indicator"]').should('not.exist');
      cy.get('[data-testid="appointments-chart"]').should('be.visible');
    });
  });
});