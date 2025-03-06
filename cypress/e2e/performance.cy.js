/// <reference types="cypress" />

describe('Performance Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should load the homepage quickly', () => {
    // Start performance measurement
    const startTime = performance.now();
    
    // Visit the homepage
    cy.visit('/');
    
    // Wait for the page to fully load
    cy.get('h1').should('be.visible');
    
    // End performance measurement
    cy.window().then(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log the load time
      cy.log(`Homepage load time: ${loadTime}ms`);
      
      // Assert that the load time is less than 3 seconds
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('should load the services page quickly', () => {
    // Start performance measurement
    const startTime = performance.now();
    
    // Visit the services page
    cy.visit('/services');
    
    // Wait for the services to load
    cy.get('.service-card').should('be.visible');
    
    // End performance measurement
    cy.window().then(() => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log the load time
      cy.log(`Services page load time: ${loadTime}ms`);
      
      // Assert that the load time is less than 3 seconds
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('should handle multiple rapid page navigations', () => {
    // Login as client
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Verify login success
      cy.url().should('include', '/client/dashboard');
      
      // Start performance measurement
      const startTime = performance.now();
      
      // Perform rapid page navigations
      cy.visit('/client/appointments');
      cy.visit('/client/profile');
      cy.visit('/services');
      cy.visit('/client/dashboard');
      
      // Wait for the dashboard to load
      cy.get('h1').should('be.visible');
      
      // End performance measurement
      cy.window().then(() => {
        const endTime = performance.now();
        const navigationTime = endTime - startTime;
        
        // Log the navigation time
        cy.log(`Multiple page navigation time: ${navigationTime}ms`);
        
        // Assert that the navigation time is reasonable
        expect(navigationTime).to.be.lessThan(10000);
      });
    });
  });

  it('should load and render a large number of appointments efficiently', () => {
    // Login as admin to access all appointments
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      
      // Navigate to appointments page
      cy.visit('/admin/appointments');
      
      // Start performance measurement
      const startTime = performance.now();
      
      // Wait for appointments to load
      cy.get('.appointment-row').should('be.visible');
      
      // End performance measurement
      cy.window().then(() => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        // Log the load time
        cy.log(`Appointments load time: ${loadTime}ms`);
        
        // Assert that the load time is reasonable
        expect(loadTime).to.be.lessThan(5000);
        
        // Count the number of appointments
        cy.get('.appointment-row').then(($rows) => {
          const count = $rows.length;
          cy.log(`Number of appointments loaded: ${count}`);
        });
      });
    });
  });

  it('should handle form submissions efficiently', () => {
    // Visit the login page
    cy.visit('/login');
    
    // Start performance measurement
    const startTime = performance.now();
    
    // Fill in the login form
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      
      // Wait for redirect to dashboard
      cy.url().should('include', '/client/dashboard');
      
      // End performance measurement
      cy.window().then(() => {
        const endTime = performance.now();
        const formSubmissionTime = endTime - startTime;
        
        // Log the form submission time
        cy.log(`Login form submission time: ${formSubmissionTime}ms`);
        
        // Assert that the form submission time is reasonable
        expect(formSubmissionTime).to.be.lessThan(5000);
      });
    });
  });
}); 