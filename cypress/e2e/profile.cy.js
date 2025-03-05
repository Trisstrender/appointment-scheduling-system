/// <reference types="cypress" />

describe('User Profile Functionality', () => {
  beforeEach(() => {
    // Reset any previous state
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should allow client to view their profile', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/profile');
      
      // Check if profile page loads correctly
      cy.get('h1').should('contain', 'My Profile');
      cy.get('.profile-card').should('be.visible');
      
      // Verify profile information is displayed
      cy.get('.profile-card').should('contain', users.client.firstName);
      cy.get('.profile-card').should('contain', users.client.lastName);
      cy.get('.profile-card').should('contain', users.client.email);
    });
  });

  it('should allow client to update their profile information', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/profile');
      
      // Click edit profile button
      cy.get('[data-testid="edit-profile-button"]').click();
      
      // Update phone number
      const newPhoneNumber = '555-123-4567';
      cy.get('input[name="phoneNumber"]').clear().type(newPhoneNumber);
      
      // Save changes
      cy.get('[data-testid="save-profile-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Profile updated successfully');
      
      // Verify updated information is displayed
      cy.get('.profile-card').should('contain', newPhoneNumber);
    });
  });

  it('should allow provider to view their profile', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/profile');
      
      // Check if profile page loads correctly
      cy.get('h1').should('contain', 'Provider Profile');
      cy.get('.profile-card').should('be.visible');
      
      // Verify profile information is displayed
      cy.get('.profile-card').should('contain', users.provider.firstName);
      cy.get('.profile-card').should('contain', users.provider.lastName);
      cy.get('.profile-card').should('contain', users.provider.email);
    });
  });

  it('should allow provider to update their profile information', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider;
      cy.login(email, password);
      cy.visit('/provider/profile');
      
      // Click edit profile button
      cy.get('[data-testid="edit-profile-button"]').click();
      
      // Update bio
      const newBio = 'I am a professional service provider with over 10 years of experience.';
      cy.get('textarea[name="bio"]').clear().type(newBio);
      
      // Save changes
      cy.get('[data-testid="save-profile-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Profile updated successfully');
      
      // Verify updated information is displayed
      cy.get('.profile-card').should('contain', newBio);
    });
  });

  it('should allow user to change their password', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/profile');
      
      // Click change password button
      cy.get('[data-testid="change-password-button"]').click();
      
      // Enter current password
      cy.get('input[name="currentPassword"]').type(password);
      
      // Enter new password
      const newPassword = 'newPassword123';
      cy.get('input[name="newPassword"]').type(newPassword);
      cy.get('input[name="confirmPassword"]').type(newPassword);
      
      // Save changes
      cy.get('[data-testid="save-password-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'Password changed successfully');
      
      // Logout
      cy.get('[aria-label="account of current user"]').click();
      cy.get('[data-testid="logout-button"]').click();
      
      // Login with new password
      cy.visit('/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(newPassword);
      cy.get('button[type="submit"]').click();
      
      // Verify successful login
      cy.url().should('include', '/client/dashboard');
      
      // Reset password back to original for future tests
      cy.visit('/client/profile');
      cy.get('[data-testid="change-password-button"]').click();
      cy.get('input[name="currentPassword"]').type(newPassword);
      cy.get('input[name="newPassword"]').type(password);
      cy.get('input[name="confirmPassword"]').type(password);
      cy.get('[data-testid="save-password-button"]').click();
    });
  });

  it('should allow admin to view and manage user profiles', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/users');
      
      // Check if users page loads correctly
      cy.get('h1').should('contain', 'User Management');
      cy.get('.user-table').should('be.visible');
      
      // Search for a specific user
      cy.get('input[placeholder="Search users..."]').type(users.client.email);
      cy.get('.user-row').should('have.length', 1);
      cy.get('.user-row').should('contain', users.client.email);
      
      // View user details
      cy.get('.user-row').find('[data-testid="view-user-button"]').click();
      cy.get('.user-details-dialog').should('be.visible');
      cy.get('.user-details-dialog').should('contain', users.client.firstName);
      cy.get('.user-details-dialog').should('contain', users.client.lastName);
      cy.get('.user-details-dialog').should('contain', users.client.email);
      
      // Close dialog
      cy.get('.user-details-dialog').find('[data-testid="close-dialog-button"]').click();
      
      // Deactivate user
      cy.get('.user-row').find('[data-testid="deactivate-user-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'User deactivated successfully');
      
      // Verify user status is updated
      cy.get('.user-row').should('contain', 'Inactive');
      
      // Reactivate user
      cy.get('.user-row').find('[data-testid="activate-user-button"]').click();
      cy.get('[data-testid="confirm-button"]').click();
      
      // Verify success message
      cy.get('.MuiAlert-root').should('contain', 'User activated successfully');
      
      // Verify user status is updated
      cy.get('.user-row').should('contain', 'Active');
    });
  });

  it('should display user activity history', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client;
      cy.login(email, password);
      cy.visit('/client/profile');
      
      // Click on activity history tab
      cy.get('[data-testid="activity-history-tab"]').click();
      
      // Verify activity history is displayed
      cy.get('.activity-history').should('be.visible');
      cy.get('.activity-item').should('have.length.at.least', 1);
      
      // Verify activity details
      cy.get('.activity-item').first().should('contain', 'Login');
      cy.get('.activity-item').first().should('contain', new Date().toLocaleDateString());
    });
  });
});