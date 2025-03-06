/// <reference types="cypress" />

describe('Notification System', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('should display notification bell in header when logged in', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Check if notification bell is displayed in header
      cy.get('[data-testid="notifications-icon"]').should('be.visible');
    });
  });

  it('should open notification dropdown when clicking the bell', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Use custom command to open notification dropdown
      cy.openNotificationDropdown();
      
      // Check if notifications are displayed
      cy.get('[data-testid="notification-item"]').should('have.length.at.least', 1);
    });
  });

  it('should mark notification as read when clicked', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Get unread notification count before clicking
      cy.getUnreadNotificationCount().then((initialCount) => {
        // Use custom command to mark notification as read
        cy.markNotificationAsRead();
        
        // Check if unread count decreased
        if (initialCount > 0) {
          cy.getUnreadNotificationCount().should('be.lessThan', initialCount);
        }
      });
    });
  });

  it('should display notifications widget on dashboard', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      cy.visit('/client/dashboard');
      
      // Use custom command to check notifications widget
      cy.checkNotificationsWidget();
      
      // Check if notifications are displayed in the widget
      cy.get('[data-testid="notifications-widget"]').within(() => {
        cy.get('li').should('have.length.at.least', 1);
      });
    });
  });

  it('should mark all notifications as read when clicking "Mark All as Read"', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      cy.visit('/client/dashboard');
      
      // Check if notifications widget is displayed
      cy.checkNotificationsWidget();
      
      // Click "Mark All as Read" button if it exists
      cy.get('[data-testid="notifications-widget"]').within(() => {
        cy.contains('Mark All as Read').then(($button) => {
          if ($button.length > 0) {
            cy.wrap($button).click();
            
            // Check if notification badge is cleared
            cy.get('.MuiBadge-badge').should('not.exist');
          }
        });
      });
    });
  });

  it('should clear all notifications when clicking "Clear All"', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.client1;
      cy.login(email, password);
      
      // Use custom command to mark all notifications as read
      cy.markAllNotificationsAsRead();
      
      // Check if notification badge is cleared
      cy.get('.MuiBadge-badge').should('not.exist');
      
      // Check if notifications are cleared
      cy.get('[data-testid="notifications-dropdown"]').within(() => {
        cy.contains('No notifications').should('be.visible');
      });
    });
  });

  it('should display notifications for provider users', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.provider1;
      cy.login(email, password);
      cy.visit('/provider/dashboard');
      
      // Use custom command to check notifications widget
      cy.checkNotificationsWidget();
    });
  });

  it('should display notifications for admin users', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.admin;
      cy.login(email, password);
      cy.visit('/admin/dashboard');
      
      // Use custom command to check notifications widget
      cy.checkNotificationsWidget();
    });
  });
}); 