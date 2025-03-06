/// <reference types="cypress" />

describe('Dashboard Functionality', () => {
  describe('Client Dashboard', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display client dashboard with upcoming appointments', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/client/dashboard');
        
        // Check dashboard components
        cy.get('h1').should('contain', 'Client Dashboard');
        cy.get('.upcoming-appointments').should('be.visible');
        cy.get('.quick-actions').should('be.visible');
      });
    });

    it('should allow client to navigate to book appointment page', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/client/dashboard');
        
        // Click on book appointment button
        cy.get('[data-testid="book-appointment-button"]').click();
        
        // Verify navigation to services page
        cy.url().should('include', '/services');
      });
    });
  });

  describe('Provider Dashboard', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display provider dashboard with today\'s appointments', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/dashboard');
        
        // Check dashboard components
        cy.get('h1').should('contain', 'Provider Dashboard');
        cy.get('.today-appointments').should('be.visible');
        cy.get('.appointment-stats').should('be.visible');
      });
    });

    it('should allow provider to navigate to manage services page', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/dashboard');
        
        // Click on manage services button
        cy.get('[data-testid="manage-services-button"]').click();
        
        // Verify navigation to services management page
        cy.url().should('include', '/provider/services');
      });
    });

    it('should display calendar view with appointments', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/dashboard');
        
        // Check if calendar is visible
        cy.get('.calendar-view').should('be.visible');
        
        // Switch to week view if available
        cy.get('.fc-timeGridWeek-button').click();
        
        // Calendar should have events or empty slots
        cy.get('.fc-view-harness').should('be.visible');
      });
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display admin dashboard with system statistics', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/dashboard');
        
        // Check dashboard components
        cy.get('h1').should('contain', 'Admin Dashboard');
        cy.get('.system-stats').should('be.visible');
        cy.get('.recent-activity').should('be.visible');
      });
    });

    it('should allow admin to navigate to user management page', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/dashboard');
        
        // Click on manage users button
        cy.get('[data-testid="manage-users-button"]').click();
        
        // Verify navigation to user management page
        cy.url().should('include', '/admin/users');
      });
    });

    it('should display charts and analytics data', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/dashboard');
        
        // Check if charts are visible
        cy.get('.analytics-chart').should('have.length.at.least', 1);
        
        // Check if data tables are visible
        cy.get('.data-table').should('be.visible');
      });
    });
  });
});