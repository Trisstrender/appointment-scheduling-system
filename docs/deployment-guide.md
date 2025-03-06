# Deployment Guide

This document provides instructions for deploying the Appointment Scheduling System to various environments.

## Prerequisites

- Docker and Docker Compose
- Java 17 or higher
- Node.js 16 or higher
- npm 8 or higher
- Git
- MySQL 8.0 or higher (for non-Docker deployments)

## Local Development Deployment

### Using Docker Compose

The easiest way to run the application locally is using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/appointment-scheduling-system.git
cd appointment-scheduling-system

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:8080/api
# Swagger UI: http://localhost:8080/api/swagger-ui.html
```

### Manual Setup

If you prefer to run the application without Docker:

#### Backend

```bash
# Navigate to the backend directory
cd backend

# Build the application
./mvnw clean package

# Run the application
java -jar target/appointment-service-0.0.1-SNAPSHOT.jar
```

#### Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

## Production Deployment

### Railway Deployment (Backend)

1. Create a Railway account at https://railway.app
2. Install the Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```
3. Login to Railway:
   ```bash
   railway login
   ```
4. Initialize a new project:
   ```bash
   railway init
   ```
5. Add a MySQL database:
   ```bash
   railway add
   ```
   Select MySQL from the list of services.
6. Deploy the backend:
   ```bash
   cd backend
   railway up
   ```
7. Configure environment variables:
   ```bash
   railway variables set SPRING_PROFILES_ACTIVE=prod
   railway variables set JWT_SECRET=your_secure_jwt_secret
   ```

### Vercel Deployment (Frontend)

1. Create a Vercel account at https://vercel.com
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Login to Vercel:
   ```bash
   vercel login
   ```
4. Deploy the frontend:
   ```bash
   cd frontend
   vercel
   ```
5. Configure environment variables:
   ```bash
   vercel env add REACT_APP_API_URL https://your-railway-app-url.railway.app/api
   ```

### Docker Hub Deployment

1. Build Docker images:
   ```bash
   docker build -t yourusername/appointment-backend ./backend
   docker build -t yourusername/appointment-frontend ./frontend
   ```
2. Push images to Docker Hub:
   ```bash
   docker push yourusername/appointment-backend
   docker push yourusername/appointment-frontend
   ```
3. Deploy using Docker Compose:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## CI/CD Pipeline

The application includes a GitHub Actions workflow for continuous integration and deployment:

1. Push changes to the main branch
2. GitHub Actions will:
   - Run backend tests
   - Run frontend tests
   - Run Cypress end-to-end tests
   - Build Docker images
   - Deploy to Railway and Vercel (when configured)

## Environment Variables

### Backend Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `dev` |
| `SPRING_DATASOURCE_URL` | Database URL | `jdbc:mysql://localhost:3306/appointment_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `password` |
| `JWT_SECRET` | Secret key for JWT tokens | `verySecretKey123!ThisIsALongSecretKeyForJWTTokenGeneration` |
| `JWT_EXPIRATION` | JWT token expiration time in milliseconds | `86400000` (24 hours) |

### Frontend Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:8080/api` |
| `REACT_APP_ENV` | Environment name | `development` |

## Monitoring and Logging

### Backend Monitoring

The backend application exposes metrics through Spring Boot Actuator:

- Health check: `http://localhost:8080/api/health` and `http://localhost:8080/api/health/details`
- Actuator endpoints: `http://localhost:8080/api/actuator`
  - Health: `http://localhost:8080/api/actuator/health`
  - Info: `http://localhost:8080/api/actuator/info`
  - Metrics: `http://localhost:8080/api/actuator/metrics`
  - Prometheus: `http://localhost:8080/api/actuator/prometheus`
  - Loggers: `http://localhost:8080/api/actuator/loggers`
  - Environment: `http://localhost:8080/api/actuator/env`
  - Mappings: `http://localhost:8080/api/actuator/mappings`

To enable the monitoring profile, start the application with the `monitoring` profile:

```bash
# Using Java command
java -jar -Dspring.profiles.active=monitoring backend/target/appointment-service-0.0.1-SNAPSHOT.jar

# Using Maven
cd backend
./mvnw spring-boot:run -Dspring.profiles.active=monitoring

# Using Docker
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Custom Health Indicators

The application includes custom health indicators:

1. **Database Health Indicator**: Checks if the database is up and running
2. **Appointment Service Health Indicator**: Checks if the core repositories are available

### Custom Info Contributors

The application includes custom info contributors:

1. **Appointment Service Info Contributor**: Adds information about the application to the `/actuator/info` endpoint

### Logging

Logs are written to the following locations:

- Backend logs: `backend/logs/application.log`
- Frontend logs: Available in the browser console during development

## Backup and Restore

### Database Backup

```bash
# Using Docker
docker exec appointment-db mysqldump -u root -ppassword appointment_db > backup.sql

# Using MySQL client
mysqldump -u root -p appointment_db > backup.sql
```

### Database Restore

```bash
# Using Docker
cat backup.sql | docker exec -i appointment-db mysql -u root -ppassword appointment_db

# Using MySQL client
mysql -u root -p appointment_db < backup.sql
```

## Troubleshooting

### Common Issues

1. **Database connection issues**:
   - Check if the database is running
   - Verify database credentials
   - Ensure the database schema exists

2. **Frontend cannot connect to backend**:
   - Check if the backend is running
   - Verify the API URL in the frontend environment variables
   - Check for CORS issues

3. **Docker issues**:
   - Ensure Docker and Docker Compose are installed
   - Check if the required ports are available
   - Verify Docker network configuration

### Getting Help

If you encounter any issues, please:

1. Check the logs for error messages
2. Consult the documentation
3. Open an issue on GitHub
4. Contact the development team

## Security Considerations

1. **Production Deployments**:
   - Use strong, unique passwords for all services
   - Enable HTTPS for all endpoints
   - Regularly update dependencies
   - Use a proper secrets management solution

2. **Database Security**:
   - Use a dedicated database user with limited permissions
   - Regularly backup the database
   - Encrypt sensitive data

3. **API Security**:
   - Use JWT tokens with appropriate expiration
   - Implement rate limiting
   - Validate all input data

## Conclusion

This deployment guide covers the basics of deploying the Appointment Scheduling System. For more advanced deployment scenarios or custom configurations, please consult the development team. 