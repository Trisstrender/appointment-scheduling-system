# Appointment Scheduling System

A comprehensive appointment scheduling service that allows users to book, manage, and track appointments with service providers.

## Project Overview

This application provides a full-featured appointment scheduling system with the following capabilities:

- User registration and authentication with role-based access (Client, Provider, Admin)
- Service browsing and appointment booking
- Provider availability management
- Interactive calendar views
- Admin dashboard for system management
- Notifications for appointment confirmations and reminders

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

## License

This project is licensed under the terms of the LICENSE file included in this repository.