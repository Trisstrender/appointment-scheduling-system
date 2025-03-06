/// <reference types="cypress" />

describe('Availability Management', () => {
  describe('Provider Availability Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display provider availability page', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/availability');
        
        // Check if availability page loads correctly
        cy.get('h1').should('contain', 'Manage Availability');
        cy.get('.availability-calendar').should('be.visible');
        cy.get('.add-availability-button').should('be.visible');
      });
    });

    it('should allow provider to add recurring availability', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/availability');
        
        // Click add availability button
        cy.get('.add-availability-button').click();
        
        // Select recurring option
        cy.get('input[name="recurring"]').check();
        
        // Select day of week
        cy.get('select[name="dayOfWeek"]').select('MONDAY');
        
        // Set start time
        cy.get('input[name="startTime"]').type('09:00');
        
        // Set end time
        cy.get('input[name="endTime"]').type('17:00');
        
        // Save availability
        cy.get('.save-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Availability added successfully');
        
        // Verify availability appears in the calendar
        cy.get('.availability-slot').should('be.visible');
      });
    });

    it('should allow provider to add specific date availability', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/availability');
        
        // Click add availability button
        cy.get('.add-availability-button').click();
        
        // Select specific date option
        cy.get('input[name="recurring"]').uncheck();
        
        // Set specific date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedDate = tomorrow.toISOString().split('T')[0];
        cy.get('input[name="specificDate"]').type(formattedDate);
        
        // Set start time
        cy.get('input[name="startTime"]').type('10:00');
        
        // Set end time
        cy.get('input[name="endTime"]').type('15:00');
        
        // Save availability
        cy.get('.save-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Availability added successfully');
        
        // Verify availability appears in the calendar
        cy.get('.availability-slot').should('be.visible');
      });
    });

    it('should allow provider to edit availability', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/availability');
        
        // Click on an existing availability slot
        cy.get('.availability-slot').first().click();
        
        // Update end time
        cy.get('input[name="endTime"]').clear().type('18:00');
        
        // Save changes
        cy.get('.save-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Availability updated successfully');
      });
    });

    it('should allow provider to delete availability', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/availability');
        
        // Get initial count of availability slots
        cy.get('.availability-slot').then(($slots) => {
          const initialCount = $slots.length;
          
          // Click on an existing availability slot
          cy.get('.availability-slot').first().click();
          
          // Click delete button
          cy.get('.delete-button').click();
          
          // Confirm deletion
          cy.get('.confirm-delete-button').click();
          
          // Verify success message
          cy.get('.success-message').should('contain', 'Availability deleted successfully');
          
          // Verify slot was removed
          cy.get('.availability-slot').should('have.length', initialCount - 1);
        });
      });
    });
  });

  describe('Client Availability View', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should show provider availability when booking', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/services');
        
        // Click on a service
        cy.get('.service-card').first().click();
        
        // Click book button
        cy.get('.book-button').click();
        
        // Verify availability calendar is shown
        cy.get('.availability-calendar').should('be.visible');
        
        // Select an available date
        cy.get('.available-date').first().click();
        
        // Verify time slots are shown
        cy.get('.time-slot').should('be.visible');
      });
    });

    it('should not allow booking outside provider availability', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/services');
        
        // Click on a service
        cy.get('.service-card').first().click();
        
        // Click book button
        cy.get('.book-button').click();
        
        // Verify unavailable dates are disabled
        cy.get('.unavailable-date').should('have.class', 'disabled');
        
        // Try to proceed without selecting a time
        cy.get('.continue-button').click();
        
        // Verify error message
        cy.get('.error-message').should('contain', 'Please select a date and time');
      });
    });
  });

  describe('Admin Availability Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow admin to view all provider availabilities', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/providers');
        
        // Click on view availability for a provider
        cy.get('.provider-row').first().find('.view-availability-button').click();
        
        // Verify availability calendar is shown
        cy.get('.availability-calendar').should('be.visible');
        
        // Verify provider name is shown
        cy.get('.provider-name').should('be.visible');
      });
    });
  });
});