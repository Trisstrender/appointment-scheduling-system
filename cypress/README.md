# Cypress End-to-End Tests

This directory contains end-to-end tests for the Appointment Scheduling System using Cypress.

## Test Structure

The tests are organized by feature and user journey:

- `auth.cy.js`: Authentication tests (login, registration, logout)
- `appointments.cy.js`: Appointment management tests
- `services.cy.js`: Service management tests
- `availability.cy.js`: Availability management tests
- `dashboard.cy.js`: Dashboard functionality tests
- `profile.cy.js`: Profile management tests
- `notifications.cy.js`: Notification system tests
- `user-journey.cy.js`: Complete user journey tests
- `performance.cy.js`: Performance tests
- `security.cy.js`: Security tests

## Running Tests

### Prerequisites

- Node.js 16 or higher
- npm 8 or higher
- Running backend and frontend applications

### Running Tests Locally

```bash
# Install dependencies
npm install

# Open Cypress Test Runner
npm run cypress:open

# Run tests in headless mode
npm run cypress:run

# Run specific test file
npm run cypress:run -- --spec "cypress/e2e/auth.cy.js"
```

### Running Tests in CI/CD

The tests are automatically run in the CI/CD pipeline using GitHub Actions. See the workflow configuration in `.github/workflows/ci.yml`.

## Custom Commands

The tests use custom commands defined in `cypress/support/commands.js`:

- `cy.login(email, password)`: Login with the specified credentials
- `cy.register(firstName, lastName, email, password, userType)`: Register a new user
- `cy.isVisible(selector)`: Check if an element is visible
- `cy.openNotificationDropdown()`: Open the notification dropdown
- `cy.getUnreadNotificationCount()`: Get the number of unread notifications
- `cy.markNotificationAsRead(index)`: Mark a notification as read
- `cy.markAllNotificationsAsRead()`: Mark all notifications as read
- `cy.checkNotificationsWidget()`: Check if the notifications widget is displayed

## Test Data

The tests use test data defined in `cypress/fixtures`:

- `users.json`: User credentials for different roles
- `services.json`: Service data for testing
- `appointments.json`: Appointment data for testing

## Best Practices

1. **Keep tests independent**: Each test should be able to run independently of others
2. **Use custom commands**: Extract common functionality into custom commands
3. **Use fixtures**: Store test data in fixtures
4. **Use data-testid attributes**: Use data-testid attributes for selecting elements
5. **Avoid flaky tests**: Make tests resilient to timing issues and network delays
6. **Test real user flows**: Tests should simulate real user interactions

## Troubleshooting

### Common Issues

1. **Tests fail due to timing issues**:
   - Use `cy.wait()` to wait for specific elements or network requests
   - Increase the default timeout in `cypress.config.js`

2. **Tests fail due to missing elements**:
   - Check if the element exists in the DOM
   - Check if the element is visible
   - Check if the element has the correct selector

3. **Tests fail due to network errors**:
   - Check if the backend is running
   - Check if the frontend is running
   - Check if the API endpoints are accessible

### Getting Help

If you encounter any issues with the tests:

1. Check the Cypress documentation: https://docs.cypress.io
2. Check the test logs in the Cypress Test Runner
3. Contact the development team