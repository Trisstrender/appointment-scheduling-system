# End-to-End Testing with Cypress

This directory contains end-to-end tests for the Appointment Scheduling System using Cypress.

## Test Structure

The tests are organized by feature:

- `auth.cy.js` - Authentication functionality (login, register, logout)
- `services.cy.js` - Service management and booking
- `appointments.cy.js` - Appointment creation, viewing, and management
- `availability.cy.js` - Provider availability management
- `profile.cy.js` - User profile management
- `dashboard.cy.js` - Dashboard functionality for all user types

## Running Tests

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- The application should be running locally (both frontend and backend)

### Commands

You can run the tests using the following npm scripts:

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all tests headlessly
npm run cypress:run

# Run specific test suites
npm run cypress:auth
npm run cypress:services
npm run cypress:appointments
npm run cypress:availability
npm run cypress:profile
npm run cypress:dashboard

# Run tests in CI environment (headless)
npm run test:e2e:ci
```

## Test Data

Test data is stored in the `fixtures` directory:

- `users.json` - Contains test user credentials for different roles

## Custom Commands

Custom Cypress commands are defined in `support/commands.js`:

- `login(email, password)` - Logs in a user with the given credentials
- `register(firstName, lastName, email, password, userType)` - Registers a new user
- `isVisible(selector)` - Checks if an element is visible

## Configuration

Cypress configuration is defined in `cypress.config.js`. Key settings include:

- Base URL: `http://localhost:3000`
- Viewport size: 1280x720
- Default timeout: 10000ms

## Best Practices

1. **Isolation**: Each test should be independent and not rely on the state from previous tests.
2. **Selectors**: Use data-testid attributes for selecting elements to make tests more resilient to UI changes.
3. **Fixtures**: Use fixtures for test data instead of hardcoding values in tests.
4. **Custom Commands**: Create custom commands for common operations to keep tests DRY.
5. **Assertions**: Make specific assertions about the expected state of the application.

## Troubleshooting

If tests are failing, check the following:

1. Ensure the application is running locally (frontend and backend)
2. Verify the test data in fixtures matches the expected format
3. Check for any changes in the UI that might affect selectors
4. Look at the Cypress screenshots and videos for visual clues

## CI/CD Integration

These tests are integrated into the CI/CD pipeline and run automatically on pull requests and merges to the main branch.