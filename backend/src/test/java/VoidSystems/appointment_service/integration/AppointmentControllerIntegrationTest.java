package VoidSystems.appointment_service.integration;

import VoidSystems.appointment_service.dto.AppointmentDTO;
import VoidSystems.appointment_service.dto.auth.AuthRequest;
import VoidSystems.appointment_service.dto.auth.AuthResponse;
import VoidSystems.appointment_service.model.Appointment;
import VoidSystems.appointment_service.domain.model.Service;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.model.Role;
import VoidSystems.appointment_service.repository.AppointmentRepository;
import VoidSystems.appointment_service.domain.repository.ServiceRepository;
import VoidSystems.appointment_service.domain.repository.ProviderRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import VoidSystems.appointment_service.domain.repository.RoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AppointmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String providerToken;
    private String clientToken;
    // Used in tests
    @SuppressWarnings("unused")
    private User adminUser;
    private User providerUser;
    private User clientUser;
    private Service testService;
    private Appointment testAppointment;

    private final DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up the database before each test
        appointmentRepository.deleteAll();
        serviceRepository.deleteAll();
        userRepository.deleteAll();

        // Create test users
        adminUser = createTestUser("admin@test.com", "Admin", "User", "ROLE_ADMIN", "ADMIN");
        providerUser = createTestUser("provider@test.com", "Provider", "User", "ROLE_PROVIDER", "PROVIDER");
        clientUser = createTestUser("client@test.com", "Client", "User", "ROLE_CLIENT", "CLIENT");

        // Get authentication tokens
        adminToken = getAuthToken("admin@test.com", "password");
        providerToken = getAuthToken("provider@test.com", "password");
        clientToken = getAuthToken("client@test.com", "password");

        // Create a test service
        testService = createTestService("Test Service", "This is a test service", 60, 99.99, providerUser.getId());

        // Create a test appointment
        LocalDateTime startTime = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endTime = startTime.plusMinutes(testService.getDurationMinutes());
        testAppointment = createTestAppointment(clientUser.getId(), providerUser.getId(), testService.getId(), startTime, endTime, "CONFIRMED");
    }

    @AfterEach
    void tearDown() {
        appointmentRepository.deleteAll();
        serviceRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createTestUser(String email, String firstName, String lastName, String roleName, String userType) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password"));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        
        // Find or create the role
        Role role = roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role newRole = new Role();
                    newRole.setName(roleName);
                    return roleRepository.save(newRole);
                });
        
        user.setRole(role);
        
        return userRepository.save(user);
    }

    private Service createTestService(String name, String description, int durationMinutes, double price, Long providerId) {
        Provider provider = providerRepository.findById(providerId)
            .orElseThrow(() -> new RuntimeException("Provider not found"));
        
        Service service = new Service();
        service.setName(name);
        service.setDescription(description);
        service.setDurationMinutes(durationMinutes);
        service.setPrice(new java.math.BigDecimal(price));
        service.setProvider(provider);
        service.setActive(true);
        return serviceRepository.save(service);
    }

    private Appointment createTestAppointment(Long clientId, Long providerId, Long serviceId, LocalDateTime startTime, LocalDateTime endTime, String status) {
        Appointment appointment = new Appointment();
        appointment.setClientId(clientId);
        appointment.setProviderId(providerId);
        appointment.setServiceId(serviceId);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    private String getAuthToken(String email, String password) throws Exception {
        AuthRequest authRequest = new AuthRequest();
        authRequest.setEmail(email);
        authRequest.setPassword(password);

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(
                result.getResponse().getContentAsString(),
                AuthResponse.class
        );

        return "Bearer " + authResponse.getAccessToken();
    }

    @Test
    void getAllAppointments_AsAdmin_ReturnsAllAppointments() throws Exception {
        mockMvc.perform(get("/api/appointments")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(testAppointment.getId()))
                .andExpect(jsonPath("$.data[0].clientId").value(testAppointment.getClientId()))
                .andExpect(jsonPath("$.data[0].providerId").value(testAppointment.getProviderId()))
                .andExpect(jsonPath("$.data[0].serviceId").value(testAppointment.getServiceId()))
                .andExpect(jsonPath("$.data[0].status").value(testAppointment.getStatus()));
    }

    @Test
    void getAppointmentById_AsAdmin_ReturnsAppointment() throws Exception {
        mockMvc.perform(get("/api/appointments/" + testAppointment.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testAppointment.getId()))
                .andExpect(jsonPath("$.data.clientId").value(testAppointment.getClientId()))
                .andExpect(jsonPath("$.data.providerId").value(testAppointment.getProviderId()))
                .andExpect(jsonPath("$.data.serviceId").value(testAppointment.getServiceId()))
                .andExpect(jsonPath("$.data.status").value(testAppointment.getStatus()));
    }

    @Test
    void getAppointmentsByClientId_AsClient_ReturnsClientAppointments() throws Exception {
        mockMvc.perform(get("/api/appointments/client/" + clientUser.getId())
                        .header("Authorization", clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(testAppointment.getId()))
                .andExpect(jsonPath("$.data[0].clientId").value(clientUser.getId()));
    }

    @Test
    void getAppointmentsByProviderId_AsProvider_ReturnsProviderAppointments() throws Exception {
        mockMvc.perform(get("/api/appointments/provider/" + providerUser.getId())
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(testAppointment.getId()))
                .andExpect(jsonPath("$.data[0].providerId").value(providerUser.getId()));
    }

    @Test
    void createAppointment_AsClient_CreatesAppointment() throws Exception {
        LocalDateTime startTime = LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endTime = startTime.plusMinutes(testService.getDurationMinutes());

        AppointmentDTO appointmentDTO = new AppointmentDTO();
        appointmentDTO.setClientId(clientUser.getId());
        appointmentDTO.setProviderId(providerUser.getId());
        appointmentDTO.setServiceId(testService.getId());
        appointmentDTO.setStartTime(startTime);
        appointmentDTO.setEndTime(endTime);
        appointmentDTO.setNotes("Test appointment notes");

        mockMvc.perform(post("/api/appointments")
                        .header("Authorization", clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(appointmentDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.clientId").value(clientUser.getId()))
                .andExpect(jsonPath("$.data.providerId").value(providerUser.getId()))
                .andExpect(jsonPath("$.data.serviceId").value(testService.getId()))
                .andExpect(jsonPath("$.data.startTime").value(startTime.format(formatter)))
                .andExpect(jsonPath("$.data.endTime").value(endTime.format(formatter)))
                .andExpect(jsonPath("$.data.notes").value("Test appointment notes"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // Verify the appointment was saved to the database
        List<Appointment> appointments = appointmentRepository.findByClientId(clientUser.getId());
        assertEquals(2, appointments.size());
        assertTrue(appointments.stream().anyMatch(a -> a.getNotes() != null && a.getNotes().equals("Test appointment notes")));
    }

    @Test
    void updateAppointment_AsClient_UpdatesAppointment() throws Exception {
        AppointmentDTO updateDTO = new AppointmentDTO();
        updateDTO.setNotes("Updated notes");

        mockMvc.perform(put("/api/appointments/" + testAppointment.getId())
                        .header("Authorization", clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testAppointment.getId()))
                .andExpect(jsonPath("$.data.notes").value("Updated notes"));

        // Verify the appointment was updated in the database
        Appointment updatedAppointment = appointmentRepository.findById(testAppointment.getId()).orElseThrow();
        assertEquals("Updated notes", updatedAppointment.getNotes());
    }

    @Test
    void updateAppointmentStatus_AsProvider_UpdatesStatus() throws Exception {
        mockMvc.perform(put("/api/appointments/" + testAppointment.getId() + "/status/COMPLETED")
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the status was updated in the database
        Appointment updatedAppointment = appointmentRepository.findById(testAppointment.getId()).orElseThrow();
        assertEquals("COMPLETED", updatedAppointment.getStatus());
    }

    @Test
    void cancelAppointment_AsClient_CancelsAppointment() throws Exception {
        mockMvc.perform(put("/api/appointments/" + testAppointment.getId() + "/cancel")
                        .header("Authorization", clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the appointment was cancelled in the database
        Appointment cancelledAppointment = appointmentRepository.findById(testAppointment.getId()).orElseThrow();
        assertEquals("CANCELLED", cancelledAppointment.getStatus());
    }

    @Test
    void deleteAppointment_AsAdmin_DeletesAppointment() throws Exception {
        mockMvc.perform(delete("/api/appointments/" + testAppointment.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the appointment was deleted
        assertTrue(appointmentRepository.findById(testAppointment.getId()).isEmpty());
    }

    @Test
    void deleteAppointment_AsClient_ReturnsForbidden() throws Exception {
        mockMvc.perform(delete("/api/appointments/" + testAppointment.getId())
                        .header("Authorization", clientToken))
                .andExpect(status().isForbidden());

        // Verify the appointment was not deleted
        assertTrue(appointmentRepository.findById(testAppointment.getId()).isPresent());
    }
}