/// <reference types="cypress" />

describe('Services Management', () => {
  describe('Public Services Browsing', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display services list for public users', () => {
      cy.visit('/services');
      cy.get('.service-card').should('have.length.at.least', 1);
      cy.get('.service-card').first().find('.service-name').should('be.visible');
      cy.get('.service-card').first().find('.service-price').should('be.visible');
      cy.get('.service-card').first().find('.service-duration').should('be.visible');
    });

    it('should allow filtering services by category', () => {
      cy.visit('/services');
      cy.get('.category-filter').click();
      cy.get('.category-option').first().click();
      cy.get('.service-card').should('have.length.at.least', 0);
    });

    it('should display service details when clicked', () => {
      cy.visit('/services');
      cy.get('.service-card').first().click();
      cy.get('.service-details').should('be.visible');
      cy.get('.service-name').should('be.visible');
      cy.get('.service-description').should('be.visible');
      cy.get('.service-provider').should('be.visible');
      cy.get('.service-price').should('be.visible');
      cy.get('.service-duration').should('be.visible');
    });
  });

  describe('Client Services Interaction', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow client to book a service', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/services');
        cy.get('.service-card').first().click();
        cy.get('.book-button').should('be.visible');
        cy.get('.book-button').click();
        cy.url().should('include', '/booking');
      });
    });
  });

  describe('Provider Services Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow provider to manage their services', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/services');
        cy.get('.service-management').should('be.visible');
        cy.get('.add-service-button').should('be.visible');
      });
    });

    it('should allow provider to add a new service', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/services');
        cy.get('.add-service-button').click();
        
        // Fill in service details
        cy.get('input[name="name"]').type('Test Service');
        cy.get('textarea[name="description"]').type('This is a test service description');
        cy.get('input[name="duration"]').type('60');
        cy.get('input[name="price"]').type('99.99');
        
        // Submit the form
        cy.get('.submit-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Service created successfully');
        
        // Verify new service appears in the list
        cy.get('.service-card').contains('Test Service').should('be.visible');
      });
    });

    it('should allow provider to edit a service', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/services');
        
        // Click edit on the first service
        cy.get('.service-card').first().find('.edit-button').click();
        
        // Update service details
        cy.get('input[name="name"]').clear().type('Updated Service Name');
        
        // Submit the form
        cy.get('.submit-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Service updated successfully');
        
        // Verify service was updated
        cy.get('.service-card').contains('Updated Service Name').should('be.visible');
      });
    });
  });
});