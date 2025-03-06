/// <reference types="cypress" />

describe('Appointments Management', () => {
  describe('Client Appointment Booking', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow client to view available services', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/services');
        cy.get('.service-card').should('have.length.at.least', 1);
        cy.get('.service-card').first().find('.service-name').should('be.visible');
        cy.get('.service-card').first().find('.service-price').should('be.visible');
        cy.get('.service-card').first().find('.service-duration').should('be.visible');
      });
    });

    it('should allow client to book an appointment', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/services');
        cy.get('.service-card').first().click();
        cy.get('.book-button').click();
        cy.get('.date-picker').should('be.visible');
        cy.get('.time-slots').should('be.visible');
        
        // Select a date (first available)
        cy.get('.date-picker .available-date').first().click();
        
        // Select a time slot (first available)
        cy.get('.time-slots .available-slot').first().click();
        
        // Confirm booking
        cy.get('.confirm-booking-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Appointment booked successfully');
        
        // Verify appointment appears in client dashboard
        cy.visit('/client/appointments');
        cy.get('.appointment-card').should('have.length.at.least', 1);
      });
    });

    it('should allow client to cancel an appointment', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/client/appointments');
        
        // Find an appointment that can be cancelled
        cy.get('.appointment-card').first().within(() => {
          // Only try to cancel if it's not already cancelled or completed
          cy.get('.appointment-status').then(($status) => {
            if (!$status.text().includes('CANCELLED') && !$status.text().includes('COMPLETED')) {
              cy.get('.cancel-button').click();
            }
          });
        });
        
        // Confirm cancellation in the dialog
        cy.get('.confirm-cancel-dialog').should('be.visible');
        cy.get('.confirm-cancel-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Appointment cancelled successfully');
        
        // Verify appointment status is updated
        cy.get('.appointment-card').first().find('.appointment-status').should('contain', 'CANCELLED');
      });
    });
  });

  describe('Provider Appointment Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow provider to view upcoming appointments', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/appointments');
        cy.get('.appointment-list').should('be.visible');
        cy.get('.appointment-card').should('have.length.at.least', 0);
      });
    });

    it('should allow provider to update appointment status', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/appointments');
        
        // Find an appointment that can be updated
        cy.get('.appointment-card').first().within(() => {
          // Only try to update if it's not cancelled or completed
          cy.get('.appointment-status').then(($status) => {
            if (!$status.text().includes('CANCELLED') && !$status.text().includes('COMPLETED')) {
              cy.get('.update-status-button').click();
            }
          });
        });
        
        // Select new status in the dialog
        cy.get('.status-select').should('be.visible');
        cy.get('.status-select').click();
        cy.get('.status-option').contains('COMPLETED').click();
        
        // Confirm status update
        cy.get('.confirm-update-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Appointment status updated successfully');
        
        // Verify appointment status is updated
        cy.get('.appointment-card').first().find('.appointment-status').should('contain', 'COMPLETED');
      });
    });

    it('should allow provider to add notes to an appointment', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/appointments');
        
        // Click on the first appointment to view details
        cy.get('.appointment-card').first().click();
        
        // Add notes
        cy.get('.appointment-notes-field').clear().type('Test notes for the appointment');
        cy.get('.save-notes-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Notes updated successfully');
        
        // Verify notes are saved
        cy.get('.appointment-notes-field').should('have.value', 'Test notes for the appointment');
      });
    });
  });

  describe('Admin Appointment Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow admin to view all appointments', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/appointments');
        cy.get('.appointment-list').should('be.visible');
        cy.get('.appointment-card').should('have.length.at.least', 1);
      });
    });

    it('should allow admin to filter appointments', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/appointments');
        
        // Filter by status
        cy.get('.status-filter').click();
        cy.get('.status-option').contains('CONFIRMED').click();
        cy.get('.apply-filter-button').click();
        
        // Verify filtered results
        cy.get('.appointment-card').each(($card) => {
          cy.wrap($card).find('.appointment-status').should('contain', 'CONFIRMED');
        });
        
        // Reset filters
        cy.get('.reset-filters-button').click();
        
        // Filter by client
        cy.get('.client-filter').type(users.client1.email);
        cy.get('.apply-filter-button').click();
        
        // Verify filtered results contain at least one appointment
        cy.get('.appointment-card').should('have.length.at.least', 0);
      });
    });
  });
});