/// <reference types="cypress" />

describe('Services Functionality', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should display services page for public users', () => {
    cy.visit('/services');
    cy.get('h1').should('contain', 'Our Services');
    cy.get('.service-card').should('have.length.at.least', 1);
  });

  it('should allow filtering services by category', () => {
    cy.visit('/services');
    // Assuming there's a filter component
    cy.get('[data-testid="service-filter"]').click();
    cy.get('[data-value="Consultation"]').click();
    cy.get('.service-card').should('have.length.at.least', 1);
    // Check that all visible services have the correct category
    cy.get('.service-card .service-category').each(($el) => {
      cy.wrap($el).should('contain', 'Consultation');
    });
  });

  it('should display service details when clicking on a service', () => {
    cy.visit('/services');
    cy.get('.service-card').first().click();
    cy.url().should('include', '/services/');
    cy.get('h1').should('be.visible');
    cy.get('.service-description').should('be.visible');
    cy.get('.service-price').should('be.visible');
    cy.get('.service-duration').should('be.visible');
    cy.get('.service-provider').should('be.visible');
  });

  it('should allow booking a service as a client', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/services');
      cy.get('.service-card').first().click();
      cy.get('[data-testid="book-service-button"]').click();
      
      // Select date and time
      cy.get('[data-testid="date-picker"]').click();
      cy.get('.MuiPickersDay-root').not('.MuiPickersDay-dayDisabled').first().click();
      cy.get('[data-testid="time-slot"]').first().click();
      
      // Confirm booking
      cy.get('[data-testid="confirm-booking-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Appointment booked successfully');
      
      // Verify redirect to appointments page
      cy.url().should('include', '/client/appointments');
    });
  });

  it('should allow provider to manage their services', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/services');
      
      // Check if services are displayed
      cy.get('.service-card').should('have.length.at.least', 1);
      
      // Add a new service
      cy.get('[data-testid="add-service-button"]').click();
      cy.get('input[name="name"]').type('New Test Service');
      cy.get('textarea[name="description"]').type('This is a test service created by Cypress');
      cy.get('input[name="durationMinutes"]').clear().type('60');
      cy.get('input[name="price"]').clear().type('99.99');
      cy.get('[data-testid="save-service-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Service created successfully');
      
      // Verify new service is in the list
      cy.get('.service-card').contains('New Test Service').should('be.visible');
    });
  });

  it('should allow admin to manage all services', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/services');
      
      // Check if services are displayed
      cy.get('.service-table').should('be.visible');
      cy.get('.service-row').should('have.length.at.least', 1);
      
      // Edit a service
      cy.get('.service-row').first().find('[data-testid="edit-service-button"]').click();
      cy.get('input[name="name"]').clear().type('Updated Service Name');
      cy.get('[data-testid="save-service-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Service updated successfully');
      
      // Verify service was updated
      cy.get('.service-row').contains('Updated Service Name').should('be.visible');
      
      // Deactivate a service
      cy.get('.service-row').first().find('[data-testid="deactivate-service-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Service deactivated successfully');
    });
  });
});