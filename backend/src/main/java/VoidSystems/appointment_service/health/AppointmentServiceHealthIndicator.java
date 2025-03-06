package VoidSystems.appointment_service.health;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import VoidSystems.appointment_service.repository.AppointmentRepository;
import VoidSystems.appointment_service.repository.ServiceRepository;
import VoidSystems.appointment_service.repository.UserRepository;

/**
 * Custom health indicator for the appointment service.
 * This health indicator checks if the core repositories are available.
 */
@Component
public class AppointmentServiceHealthIndicator implements HealthIndicator {

    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public AppointmentServiceHealthIndicator(
            AppointmentRepository appointmentRepository,
            ServiceRepository serviceRepository,
            UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Health health() {
        try {
            // Check if repositories are available by calling count methods
            long appointmentCount = appointmentRepository.count();
            long serviceCount = serviceRepository.count();
            long userCount = userRepository.count();
            
            return Health.up()
                    .withDetail("appointmentCount", appointmentCount)
                    .withDetail("serviceCount", serviceCount)
                    .withDetail("userCount", userCount)
                    .build();
        } catch (Exception e) {
            return Health.down()
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
} 