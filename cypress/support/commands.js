// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// Custom command for logging in
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for redirect or dashboard to load
  cy.url().should('not.include', '/login');
});

// Custom command for registering a new user
Cypress.Commands.add('register', (firstName, lastName, email, password, userType) => {
  cy.visit('/register');
  cy.get('input[name="firstName"]').type(firstName);
  cy.get('input[name="lastName"]').type(lastName);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="confirmPassword"]').type(password);
  cy.get('#userType').click();
  cy.get(`[data-value="${userType}"]`).click();
  cy.get('button[type="submit"]').click();
  // Wait for redirect to login page
  cy.url().should('include', '/login');
});

// Custom command to check if an element is visible
Cypress.Commands.add('isVisible', (selector) => {
  cy.get(selector).should('be.visible');
});

// Custom command to open notification dropdown
Cypress.Commands.add('openNotificationDropdown', () => {
  cy.get('[data-testid="notifications-icon"]').click();
  cy.get('[data-testid="notifications-dropdown"]').should('be.visible');
});

// Custom command to get unread notification count
Cypress.Commands.add('getUnreadNotificationCount', () => {
  return cy.get('.MuiBadge-badge').then(($badge) => {
    if ($badge.length === 0) {
      return 0;
    }
    return parseInt($badge.text()) || 0;
  });
});

// Custom command to mark a notification as read
Cypress.Commands.add('markNotificationAsRead', (index = 0) => {
  cy.openNotificationDropdown();
  cy.get('[data-testid="notification-item"]').not('.read').eq(index).click();
});

// Custom command to mark all notifications as read
Cypress.Commands.add('markAllNotificationsAsRead', () => {
  cy.openNotificationDropdown();
  cy.contains('Clear All').click();
});

// Custom command to check notifications widget
Cypress.Commands.add('checkNotificationsWidget', () => {
  cy.get('[data-testid="notifications-widget"]').should('be.visible');
  cy.get('[data-testid="notifications-widget"]').within(() => {
    cy.contains('Notifications').should('be.visible');
  });
});