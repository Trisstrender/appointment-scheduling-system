package VoidSystems.appointment_service.info;

import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.stereotype.Component;

import VoidSystems.appointment_service.domain.repository.AppointmentRepository;
import VoidSystems.appointment_service.domain.repository.ServiceRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

/**
 * Custom info contributor for the appointment service.
 * This info contributor adds information about the application to the /actuator/info endpoint.
 */
@Component
public class AppointmentServiceInfoContributor implements InfoContributor {

    private final AppointmentRepository appointmentRepository;
    private final ServiceRepository serviceRepository;
    private final UserRepository userRepository;

    public AppointmentServiceInfoContributor(
            AppointmentRepository appointmentRepository,
            ServiceRepository serviceRepository,
            UserRepository userRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void contribute(Info.Builder builder) {
        Map<String, Object> details = new HashMap<>();
        
        // Add application information
        Map<String, Object> appInfo = new HashMap<>();
        appInfo.put("name", "Appointment Scheduling System");
        appInfo.put("version", "1.0.0");
        appInfo.put("description", "A comprehensive appointment scheduling service");
        details.put("application", appInfo);
        
        // Add statistics
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("appointments", appointmentRepository.count());
            stats.put("services", serviceRepository.count());
            stats.put("users", userRepository.count());
            details.put("statistics", stats);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Failed to retrieve statistics");
            error.put("reason", e.getMessage());
            details.put("error", error);
        }
        
        // Add system information
        Map<String, Object> systemInfo = new HashMap<>();
        systemInfo.put("javaVersion", System.getProperty("java.version"));
        systemInfo.put("javaVendor", System.getProperty("java.vendor"));
        systemInfo.put("osName", System.getProperty("os.name"));
        systemInfo.put("osVersion", System.getProperty("os.version"));
        systemInfo.put("osArch", System.getProperty("os.arch"));
        details.put("system", systemInfo);
        
        builder.withDetails(details);
    }
} 