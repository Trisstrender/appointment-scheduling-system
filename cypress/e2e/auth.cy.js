/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.get('h1').should('contain', 'Sign in');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.get('a[href="/register"]').should('be.visible');
  });

  it('should display register page', () => {
    cy.visit('/register');
    cy.get('h1').should('contain', 'Sign up');
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');
    cy.get('#userType').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.get('a[href="/login"]').should('be.visible');
  });

  it('should show validation errors on login form', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'Email is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Password is required');
  });

  it('should show validation errors on register form', () => {
    cy.visit('/register');
    cy.get('button[type="submit"]').click();
    cy.get('p.MuiFormHelperText-root').should('contain', 'First name is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Last name is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Email is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Password is required');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Please confirm your password');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Please select a user type');
  });

  it('should login as client successfully', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.url().should('include', '/client/dashboard');
      cy.get('header').should('contain', 'Client Dashboard');
    });
  });

  it('should login as provider successfully', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.url().should('include', '/provider/dashboard');
      cy.get('header').should('contain', 'Provider Dashboard');
    });
  });

  it('should login as admin successfully', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.url().should('include', '/admin/dashboard');
      cy.get('header').should('contain', 'Admin Dashboard');
    });
  });

  it('should show error message for invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.get('.MuiAlert-root').should('be.visible');
    cy.get('.MuiAlert-root').should('contain', 'Invalid email or password');
  });

  it('should register a new user successfully', () => {
    cy.fixture('users').then((users) => {
      const { firstName, lastName, email, password, userType } = users.newUser;
      // Generate a unique email to avoid conflicts
      const uniqueEmail = `test-${Date.now()}@example.com`;
      cy.register(firstName, lastName, uniqueEmail, password, userType);
      cy.url().should('include', '/login');
      cy.get('.MuiAlert-root').should('contain', 'Registration successful');
    });
  });

  it('should logout successfully', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.url().should('include', '/client/dashboard');
      
      // Click on the user menu
      cy.get('[aria-label="account of current user"]').click();
      
      // Click on the logout option
      cy.get('[data-testid="logout-button"]').click();
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
    });
  });
});