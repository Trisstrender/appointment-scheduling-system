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