/// <reference types="cypress" />

describe('Appointments Functionality', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow client to view their appointments', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/appointments');
      
      // Check if appointments page loads correctly
      cy.get('h1').should('contain', 'My Appointments');
      cy.get('.appointment-list').should('be.visible');
    });
  });

  it('should allow client to filter appointments by status', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/appointments');
      
      // Filter by status
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-value="CONFIRMED"]').click();
      
      // Check that all visible appointments have the correct status
      cy.get('.appointment-card .appointment-status').each(($el) => {
        cy.wrap($el).should('contain', 'Confirmed');
      });
    });
  });

  it('should allow client to cancel an appointment', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/appointments');
      
      // Find a confirmed appointment and cancel it
      cy.get('.appointment-card')
        .contains('Confirmed')
        .parents('.appointment-card')
        .find('[data-testid="cancel-appointment-button"]')
        .click();
      
      // Confirm cancellation
      cy.get('[data-testid="confirm-cancel-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Appointment cancelled successfully');
    });
  });

  it('should allow provider to view their appointments', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/appointments');
      
      // Check if appointments page loads correctly
      cy.get('h1').should('contain', 'Appointments');
      cy.get('.appointment-list').should('be.visible');
    });
  });

  it('should allow provider to update appointment status', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/appointments');
      
      // Find a confirmed appointment and mark it as completed
      cy.get('.appointment-card')
        .contains('Confirmed')
        .parents('.appointment-card')
        .find('[data-testid="complete-appointment-button"]')
        .click();
      
      // Confirm status update
      cy.get('[data-testid="confirm-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Appointment marked as completed');
    });
  });

  it('should allow admin to manage all appointments', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/appointments');
      
      // Check if appointments page loads correctly
      cy.get('h1').should('contain', 'Appointment Management');
      cy.get('.appointment-table').should('be.visible');
      
      // Filter appointments
      cy.get('[data-testid="client-filter"]').click();
      cy.get('.MuiMenuItem-root').first().click();
      
      // Edit an appointment
      cy.get('.appointment-row').first().find('[data-testid="edit-appointment-button"]').click();
      cy.get('textarea[name="notes"]').clear().type('Updated by admin via Cypress test');
      cy.get('[data-testid="save-appointment-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Appointment updated successfully');
    });
  });

  it('should display calendar view for provider appointments', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/appointments');
      
      // Switch to calendar view
      cy.get('[data-testid="calendar-view-button"]').click();
      
      // Check if calendar is displayed
      cy.get('.fc-view-harness').should('be.visible');
      cy.get('.fc-event').should('have.length.at.least', 1);
      
      // Click on an event
      cy.get('.fc-event').first().click();
      
      // Check if appointment details are displayed
      cy.get('[data-testid="appointment-details-dialog"]').should('be.visible');
      cy.get('[data-testid="appointment-details-dialog"]').should('contain', 'Appointment Details');
    });
  });

  it('should allow booking a new appointment from client dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/dashboard');
      
      // Click on book appointment button
      cy.get('[data-testid="book-appointment-button"]').click();
      
      // Select a service
      cy.get('.service-card').first().click();
      
      // Select date and time
      cy.get('[data-testid="date-picker"]').click();
      cy.get('.MuiPickersDay-root').not('.MuiPickersDay-dayDisabled').first().click();
      cy.get('[data-testid="time-slot"]').first().click();
      
      // Confirm booking
      cy.get('[data-testid="confirm-booking-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Appointment booked successfully');
    });
  });
});