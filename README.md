# Appointment Scheduling System

A comprehensive appointment scheduling service that allows users to book, manage, and track appointments with service providers.

## Project Overview

This application provides a full-featured appointment scheduling system with the following capabilities:

- User registration and authentication with role-based access (Client, Provider, Admin)
- Service browsing and appointment booking
- Provider availability management
- Interactive calendar views
- Admin dashboard for system management
- Real-time notifications for appointment confirmations and reminders

## Technology Stack

### Backend
- Spring Boot
- Spring Data JPA with Hibernate
- MySQL/MariaDB
- Spring Security with JWT
- Swagger/OpenAPI for API documentation

### Frontend
- React
- Redux/Context API for state management
- Material UI/Tailwind CSS
- FullCalendar for calendar interface

### Testing
- JUnit & Mockito for backend unit tests
- React Testing Library for frontend component tests
- Cypress for end-to-end testing
- Jest for JavaScript unit tests

### Deployment
- Docker and Docker Compose
- Railway (Backend and Database)
- Vercel (Frontend)
- GitHub Actions for CI/CD

## Documentation

For detailed information about the implementation plan, technical components, and deployment strategy, please refer to:

- [Implementation Plan](docs/implementation-plan.md)
- [Implementation Steps](docs/implementation-steps.md)
- [Notification System](docs/notification-system.md)
- [Testing Strategy](docs/testing-strategy.md)
- [Deployment Guide](docs/deployment-guide.md)
- [User Guide](docs/user-guide.md)
- [Cypress E2E Tests](cypress/README.md)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Java 17 or higher
- Maven
- Docker and Docker Compose (optional, for containerized setup)

### Running the Application

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Running Tests
```bash
# Backend tests
cd backend
./mvnw test

# Frontend component tests
cd frontend
npm test

# End-to-end tests
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode
```

### Docker Setup
```bash
docker-compose up -d
```

## Features

### Notification System

The application includes a comprehensive notification system that keeps users informed about their appointments:

- **Real-time Notifications**: Users receive notifications for appointment confirmations, cancellations, and reminders.
- **Notification Bell**: A notification bell in the header displays the number of unread notifications.
- **Notification Center**: Users can view all their notifications in a dedicated widget on their dashboard.
- **Mark as Read**: Users can mark notifications as read individually or all at once.
- **Notification Types**:
  - Appointment Confirmations
  - Appointment Cancellations
  - Appointment Reminders
  - New Appointment Requests (for providers)

## Demo Accounts

The application comes with pre-configured demo accounts for testing:

| Role     | Email                 | Password  |
|----------|----------------------|-----------|
| Admin    | admin@example.com    | password  |
| Provider | provider1@example.com | password  |
| Provider | provider2@example.com | password  |
| Client   | client1@example.com  | password  |
| Client   | client2@example.com  | password  |

### Demo Data

The application is seeded with the following demo data:

- **Providers**:
  - John Provider: Senior Therapist offering massage services
  - Jane Provider: Hair Stylist offering hair services

- **Services**:
  - Swedish Massage (60 min, $80)
  - Deep Tissue Massage (60 min, $100)
  - Hot Stone Massage (90 min, $120)
  - Haircut (45 min, $50)
  - Hair Coloring (120 min, $120)
  - Hair Styling (60 min, $70)

- **Availability**:
  - John Provider: Monday to Friday, 9 AM to 5 PM
  - Jane Provider: Tuesday to Saturday, 10 AM to 6 PM

- **Sample Appointments**: Several appointments are pre-configured for demonstration purposes

## License

This project is licensed under the terms of the LICENSE file included in this repository.