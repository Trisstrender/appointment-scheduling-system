/// <reference types="cypress" />

describe('Profile Management', () => {
  describe('Client Profile Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display client profile information', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/client/profile');
        
        // Check if profile information is displayed
        cy.get('.profile-card').should('be.visible');
        cy.get('.profile-card').should('contain', users.client1.firstName);
        cy.get('.profile-card').should('contain', users.client1.lastName);
        cy.get('.profile-card').should('contain', users.client1.email);
      });
    });

    it('should allow client to update profile information', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/client/profile');
        
        // Click edit profile button
        cy.get('.edit-profile-button').click();
        
        // Update phone number
        cy.get('input[name="phoneNumber"]').clear().type('555-123-4567');
        
        // Save changes
        cy.get('.save-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Profile updated successfully');
        
        // Verify phone number was updated
        cy.get('.profile-card').should('contain', '555-123-4567');
      });
    });

    it('should allow client to change password', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.client1;
        cy.login(email, password);
        cy.visit('/client/profile');
        
        // Click change password button
        cy.get('.change-password-button').click();
        
        // Enter current password
        cy.get('input[name="currentPassword"]').type(password);
        
        // Enter new password
        cy.get('input[name="newPassword"]').type('newPassword123');
        
        // Confirm new password
        cy.get('input[name="confirmPassword"]').type('newPassword123');
        
        // Save changes
        cy.get('.save-password-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Password changed successfully');
      });
    });
  });

  describe('Provider Profile Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should display provider profile information', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/profile');
        
        // Check if profile information is displayed
        cy.get('.profile-card').should('be.visible');
        cy.get('.profile-card').should('contain', users.provider1.firstName);
        cy.get('.profile-card').should('contain', users.provider1.lastName);
        cy.get('.profile-card').should('contain', users.provider1.email);
      });
    });

    it('should allow provider to update profile information', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.provider1;
        cy.login(email, password);
        cy.visit('/provider/profile');
        
        // Click edit profile button
        cy.get('.edit-profile-button').click();
        
        // Update title
        cy.get('input[name="title"]').clear().type('Senior Massage Therapist');
        
        // Update description
        cy.get('textarea[name="description"]').clear().type('Experienced therapist specializing in deep tissue massage.');
        
        // Save changes
        cy.get('.save-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'Profile updated successfully');
        
        // Verify title was updated
        cy.get('.profile-card').should('contain', 'Senior Massage Therapist');
      });
    });
  });

  describe('Admin User Management', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it('should allow admin to view all users', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/users');
        
        // Check if user list is displayed
        cy.get('.user-list').should('be.visible');
        cy.get('.user-row').should('have.length.at.least', 3);
      });
    });

    it('should allow admin to search for users', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/users');
        
        // Search for a client
        cy.get('input[placeholder="Search users..."]').type(users.client1.email);
        cy.get('.search-button').click();
        
        // Verify search results
        cy.get('.user-row').should('contain', users.client1.email);
      });
    });

    it('should allow admin to view user details', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/users');
        
        // Click on a user to view details
        cy.get('.user-row').contains(users.client1.email).click();
        
        // Verify user details are displayed
        cy.get('.user-details-dialog').should('be.visible');
        cy.get('.user-details-dialog').should('contain', users.client1.firstName);
        cy.get('.user-details-dialog').should('contain', users.client1.lastName);
        cy.get('.user-details-dialog').should('contain', users.client1.email);
      });
    });

    it('should allow admin to create a new user', () => {
      cy.fixture('users').then((users) => {
        const { email, password } = users.admin;
        cy.login(email, password);
        cy.visit('/admin/users');
        
        // Click add user button
        cy.get('.add-user-button').click();
        
        // Fill in user details
        const uniqueEmail = `test-${Date.now()}@example.com`;
        cy.get('input[name="firstName"]').type('Test');
        cy.get('input[name="lastName"]').type('User');
        cy.get('input[name="email"]').type(uniqueEmail);
        cy.get('input[name="password"]').type('password123');
        cy.get('select[name="role"]').select('CLIENT');
        
        // Save user
        cy.get('.save-button').click();
        
        // Verify success message
        cy.get('.success-message').should('contain', 'User created successfully');
        
        // Verify user appears in the list
        cy.get('.user-row').should('contain', uniqueEmail);
      });
    });
  });
});