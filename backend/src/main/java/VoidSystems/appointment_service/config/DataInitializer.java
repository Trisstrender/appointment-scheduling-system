package VoidSystems.appointment_service.config;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import VoidSystems.appointment_service.domain.model.Admin;
import VoidSystems.appointment_service.domain.model.Appointment;
import VoidSystems.appointment_service.domain.model.AppointmentStatus;
import VoidSystems.appointment_service.domain.model.Availability;
import VoidSystems.appointment_service.domain.model.Client;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.Role;
import VoidSystems.appointment_service.domain.model.Service;
import VoidSystems.appointment_service.domain.repository.AdminRepository;
import VoidSystems.appointment_service.domain.repository.AppointmentRepository;
import VoidSystems.appointment_service.domain.repository.AppointmentStatusRepository;
import VoidSystems.appointment_service.domain.repository.AvailabilityRepository;
import VoidSystems.appointment_service.domain.repository.ClientRepository;
import VoidSystems.appointment_service.domain.repository.ProviderRepository;
import VoidSystems.appointment_service.domain.repository.RoleRepository;
import VoidSystems.appointment_service.domain.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;
    private final AdminRepository adminRepository;
    private final ServiceRepository serviceRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AppointmentStatusRepository appointmentStatusRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile("dev")
    public CommandLineRunner initDevData() {
        return args -> {
            log.info("Initializing development data...");
            
            // Check if data already exists
            if (roleRepository.count() > 0) {
                log.info("Data already initialized, skipping...");
                return;
            }
            
            // Create roles
            Role clientRole = roleRepository.findByName("ROLE_CLIENT")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_CLIENT").build()));
            
            Role providerRole = roleRepository.findByName("ROLE_PROVIDER")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_PROVIDER").build()));
            
            Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder().name("ROLE_ADMIN").build()));
            
            // Create appointment statuses
            AppointmentStatus pendingStatus = appointmentStatusRepository.findByName(AppointmentStatus.PENDING)
                    .orElseGet(() -> appointmentStatusRepository.save(AppointmentStatus.builder().name(AppointmentStatus.PENDING).build()));
            
            AppointmentStatus confirmedStatus = appointmentStatusRepository.findByName(AppointmentStatus.CONFIRMED)
                    .orElseGet(() -> appointmentStatusRepository.save(AppointmentStatus.builder().name(AppointmentStatus.CONFIRMED).build()));
            
            @SuppressWarnings("unused")
            AppointmentStatus cancelledStatus = appointmentStatusRepository.findByName(AppointmentStatus.CANCELLED)
                    .orElseGet(() -> appointmentStatusRepository.save(AppointmentStatus.builder().name(AppointmentStatus.CANCELLED).build()));
            
            @SuppressWarnings("unused")
            AppointmentStatus completedStatus = appointmentStatusRepository.findByName(AppointmentStatus.COMPLETED)
                    .orElseGet(() -> appointmentStatusRepository.save(AppointmentStatus.builder().name(AppointmentStatus.COMPLETED).build()));
            
            @SuppressWarnings("unused")
            AppointmentStatus noShowStatus = appointmentStatusRepository.findByName(AppointmentStatus.NO_SHOW)
                    .orElseGet(() -> appointmentStatusRepository.save(AppointmentStatus.builder().name(AppointmentStatus.NO_SHOW).build()));
            
            // Create demo users
            Client client = clientRepository.save(Client.builder()
                    .email("client@demo.com")
                    .password(passwordEncoder.encode("demo123"))
                    .firstName("Demo")
                    .lastName("Client")
                    .phoneNumber("123-456-7890")
                    .role(clientRole)
                    .build());
            
            Provider provider = providerRepository.save(Provider.builder()
                    .email("provider@demo.com")
                    .password(passwordEncoder.encode("demo123"))
                    .firstName("Demo")
                    .lastName("Provider")
                    .phoneNumber("123-456-7891")
                    .title("Senior Consultant")
                    .description("Experienced professional with over 10 years of expertise.")
                    .role(providerRole)
                    .build());
            
            @SuppressWarnings("unused")
            Admin admin = adminRepository.save(Admin.builder()
                    .email("admin@demo.com")
                    .password(passwordEncoder.encode("demo123"))
                    .firstName("Demo")
                    .lastName("Admin")
                    .phoneNumber("123-456-7892")
                    .superAdmin(true)
                    .role(adminRole)
                    .build());
            
            // Create services
            List<Service> services = Arrays.asList(
                Service.builder()
                    .name("Basic Consultation")
                    .description("A 30-minute consultation to discuss your needs.")
                    .durationMinutes(30)
                    .price(new BigDecimal("50.00"))
                    .provider(provider)
                    .active(true)
                    .build(),
                Service.builder()
                    .name("Comprehensive Assessment")
                    .description("A 60-minute in-depth assessment of your situation.")
                    .durationMinutes(60)
                    .price(new BigDecimal("100.00"))
                    .provider(provider)
                    .active(true)
                    .build(),
                Service.builder()
                    .name("Follow-up Session")
                    .description("A 45-minute follow-up to track progress.")
                    .durationMinutes(45)
                    .price(new BigDecimal("75.00"))
                    .provider(provider)
                    .active(true)
                    .build()
            );
            
            serviceRepository.saveAll(services);
            
            // Create availability
            List<Availability> availabilities = Arrays.asList(
                // Recurring weekly availability
                Availability.builder()
                    .provider(provider)
                    .dayOfWeek(DayOfWeek.MONDAY)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .recurring(true)
                    .build(),
                Availability.builder()
                    .provider(provider)
                    .dayOfWeek(DayOfWeek.WEDNESDAY)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .recurring(true)
                    .build(),
                Availability.builder()
                    .provider(provider)
                    .dayOfWeek(DayOfWeek.FRIDAY)
                    .startTime(LocalTime.of(9, 0))
                    .endTime(LocalTime.of(17, 0))
                    .recurring(true)
                    .build(),
                
                // Specific date availability
                Availability.builder()
                    .provider(provider)
                    .specificDate(LocalDate.now().plusDays(2))
                    .startTime(LocalTime.of(10, 0))
                    .endTime(LocalTime.of(16, 0))
                    .recurring(false)
                    .build()
            );
            
            availabilityRepository.saveAll(availabilities);
            
            // Create appointments
            LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
            LocalDateTime nextWeek = LocalDateTime.now().plusDays(7).withHour(14).withMinute(0).withSecond(0).withNano(0);
            
            List<Appointment> appointments = Arrays.asList(
                Appointment.builder()
                    .client(client)
                    .provider(provider)
                    .service(services.get(0))
                    .startTime(tomorrow)
                    .endTime(tomorrow.plusMinutes(services.get(0).getDurationMinutes()))
                    .status(confirmedStatus)
                    .notes("Initial consultation")
                    .build(),
                Appointment.builder()
                    .client(client)
                    .provider(provider)
                    .service(services.get(1))
                    .startTime(nextWeek)
                    .endTime(nextWeek.plusMinutes(services.get(1).getDurationMinutes()))
                    .status(pendingStatus)
                    .notes("Follow-up to discuss progress")
                    .build()
            );
            
            appointmentRepository.saveAll(appointments);
            
            log.info("Development data initialized successfully!");
        };
    }
}