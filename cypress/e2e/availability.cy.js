/// <reference types="cypress" />

describe('Availability Functionality', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow provider to view their availability', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/availability');
      
      // Check if availability page loads correctly
      cy.get('h1').should('contain', 'Manage Availability');
      cy.get('.availability-calendar').should('be.visible');
    });
  });

  it('should allow provider to add recurring availability', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/availability');
      
      // Click on add recurring availability button
      cy.get('[data-testid="add-recurring-availability-button"]').click();
      
      // Select day of week
      cy.get('#dayOfWeek').click();
      cy.get('[data-value="1"]').click(); // Monday
      
      // Set start time
      cy.get('#startTime').click();
      cy.get('.MuiClock-hour').contains('9').click();
      cy.get('.MuiClock-minute').contains('00').click();
      cy.get('.MuiDialogActions-root button').contains('OK').click();
      
      // Set end time
      cy.get('#endTime').click();
      cy.get('.MuiClock-hour').contains('17').click();
      cy.get('.MuiClock-minute').contains('00').click();
      cy.get('.MuiDialogActions-root button').contains('OK').click();
      
      // Save availability
      cy.get('[data-testid="save-availability-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Recurring availability added successfully');
      
      // Verify availability is displayed in the calendar
      cy.get('.availability-calendar').should('contain', 'Monday: 9:00 AM - 5:00 PM');
    });
  });

  it('should allow provider to add specific date availability', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/availability');
      
      // Click on add specific date availability button
      cy.get('[data-testid="add-specific-availability-button"]').click();
      
      // Select date (tomorrow)
      cy.get('#specificDate').click();
      cy.get('.MuiPickersDay-root').not('.MuiPickersDay-dayDisabled').eq(1).click();
      
      // Set start time
      cy.get('#startTime').click();
      cy.get('.MuiClock-hour').contains('10').click();
      cy.get('.MuiClock-minute').contains('00').click();
      cy.get('.MuiDialogActions-root button').contains('OK').click();
      
      // Set end time
      cy.get('#endTime').click();
      cy.get('.MuiClock-hour').contains('16').click();
      cy.get('.MuiClock-minute').contains('00').click();
      cy.get('.MuiDialogActions-root button').contains('OK').click();
      
      // Save availability
      cy.get('[data-testid="save-availability-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Specific date availability added successfully');
      
      // Switch to calendar view
      cy.get('[data-testid="calendar-view-tab"]').click();
      
      // Verify availability is displayed in the calendar
      cy.get('.fc-event').should('have.length.at.least', 1);
    });
  });

  it('should allow provider to edit availability', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/availability');
      
      // Switch to list view if not already there
      cy.get('[data-testid="list-view-tab"]').click();
      
      // Click edit on the first availability slot
      cy.get('.availability-item').first().find('[data-testid="edit-availability-button"]').click();
      
      // Update end time
      cy.get('#endTime').click();
      cy.get('.MuiClock-hour').contains('18').click();
      cy.get('.MuiClock-minute').contains('00').click();
      cy.get('.MuiDialogActions-root button').contains('OK').click();
      
      // Save changes
      cy.get('[data-testid="save-availability-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Availability updated successfully');
    });
  });

  it('should allow provider to delete availability', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/availability');
      
      // Switch to list view if not already there
      cy.get('[data-testid="list-view-tab"]').click();
      
      // Get the count of availability items before deletion
      cy.get('.availability-item').then(($items) => {
        const countBefore = $items.length;
        
        // Click delete on the first availability slot
        cy.get('.availability-item').first().find('[data-testid="delete-availability-button"]').click();
        
        // Confirm deletion
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        // Verify success message
        cy.get('.MuiAlert-root').should('contain', 'Availability deleted successfully');
        
        // Verify the count of availability items has decreased
        cy.get('.availability-item').should('have.length', countBefore - 1);
      });
    });
  });

  it('should show available time slots to clients when booking', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/services');
      
      // Click on a service to book
      cy.get('.service-card').first().click();
      cy.get('[data-testid="book-service-button"]').click();
      
      // Select a date
      cy.get('[data-testid="date-picker"]').click();
      cy.get('.MuiPickersDay-root').not('.MuiPickersDay-dayDisabled').first().click();
      
      // Verify time slots are displayed
      cy.get('[data-testid="time-slots-container"]').should('be.visible');
      cy.get('[data-testid="time-slot"]').should('have.length.at.least', 1);
      
      // Select a time slot
      cy.get('[data-testid="time-slot"]').first().click();
      
      // Verify the selected time slot is highlighted
      cy.get('[data-testid="time-slot"].selected').should('have.length', 1);
    });
  });

  it('should not show unavailable time slots to clients', () => {
    // First, book an appointment to make a time slot unavailable
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/services');
      
      // Click on a service to book
      cy.get('.service-card').first().click();
      cy.get('[data-testid="book-service-button"]').click();
      
      // Select a date
      cy.get('[data-testid="date-picker"]').click();
      cy.get('.MuiPickersDay-root').not('.MuiPickersDay-dayDisabled').first().click();
      
      // Select the first available time slot
      cy.get('[data-testid="time-slot"]').first().click();
      
      // Confirm booking
      cy.get('[data-testid="confirm-booking-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Appointment booked successfully');
      
      // Logout
      cy.get('[aria-label="account of current user"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Login as another client
      cy.login('anotherclient@example.com', 'password123');
      cy.visit('/services');
      
      // Click on the same service to book
      cy.get('.service-card').first().click();
      cy.get('[data-testid="book-service-button"]').click();
      
      // Select the same date
      cy.get('[data-testid="date-picker"]').click();
      cy.get('.MuiPickersDay-root').not('.MuiPickersDay-dayDisabled').first().click();
      
      // Verify the previously booked time slot is not available
      cy.get('[data-testid="time-slot"].unavailable').should('have.length.at.least', 1);
    });
  });
});