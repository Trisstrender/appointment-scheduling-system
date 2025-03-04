package VoidSystems.appointment_service.integration;

import VoidSystems.appointment_service.dto.ServiceDTO;
import VoidSystems.appointment_service.dto.auth.AuthRequest;
import VoidSystems.appointment_service.dto.auth.AuthResponse;
import VoidSystems.appointment_service.model.Service;
import VoidSystems.appointment_service.model.User;
import VoidSystems.appointment_service.repository.ServiceRepository;
import VoidSystems.appointment_service.repository.UserRepository;
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

// import java.math.BigDecimal; // Not used
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ServiceControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String providerToken;
    private String clientToken;
    // Used in tests
    @SuppressWarnings("unused")
    private User adminUser;
    private User providerUser;
    // Used in tests
    @SuppressWarnings("unused")
    private User clientUser;
    private Service testService;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up the database before each test
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
    }

    @AfterEach
    void tearDown() {
        serviceRepository.deleteAll();
        userRepository.deleteAll();
    }

    private User createTestUser(String email, String firstName, String lastName, String role, String userType) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password"));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setRole(role);
        user.setUserType(userType);
        user.setActive(true);
        return userRepository.save(user);
    }

    private Service createTestService(String name, String description, int durationMinutes, double price, Long providerId) {
        Service service = new Service();
        service.setName(name);
        service.setDescription(description);
        service.setDurationMinutes(durationMinutes);
        service.setPrice(price);
        service.setProviderId(providerId);
        service.setActive(true);
        return serviceRepository.save(service);
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
    void getAllServices_ReturnsAllActiveServices() throws Exception {
        mockMvc.perform(get("/api/services")
                        .param("activeOnly", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(testService.getId()))
                .andExpect(jsonPath("$.data[0].name").value(testService.getName()))
                .andExpect(jsonPath("$.data[0].active").value(true));
    }

    @Test
    void getServiceById_ReturnsService() throws Exception {
        mockMvc.perform(get("/api/services/" + testService.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testService.getId()))
                .andExpect(jsonPath("$.data.name").value(testService.getName()))
                .andExpect(jsonPath("$.data.description").value(testService.getDescription()))
                .andExpect(jsonPath("$.data.durationMinutes").value(testService.getDurationMinutes()))
                .andExpect(jsonPath("$.data.price").value(testService.getPrice()))
                .andExpect(jsonPath("$.data.providerId").value(testService.getProviderId()));
    }

    @Test
    void getServicesByProviderId_ReturnsProviderServices() throws Exception {
        mockMvc.perform(get("/api/services/provider/" + providerUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].id").value(testService.getId()))
                .andExpect(jsonPath("$.data[0].name").value(testService.getName()))
                .andExpect(jsonPath("$.data[0].providerId").value(providerUser.getId()));
    }

    @Test
    void createService_AsProvider_CreatesService() throws Exception {
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setName("New Service");
        serviceDTO.setDescription("This is a new service");
        serviceDTO.setDurationMinutes(30);
        serviceDTO.setPrice(49.99);
        serviceDTO.setActive(true);

        mockMvc.perform(post("/api/services/provider/" + providerUser.getId())
                        .header("Authorization", providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("New Service"))
                .andExpect(jsonPath("$.data.description").value("This is a new service"))
                .andExpect(jsonPath("$.data.durationMinutes").value(30))
                .andExpect(jsonPath("$.data.price").value(49.99))
                .andExpect(jsonPath("$.data.providerId").value(providerUser.getId()))
                .andExpect(jsonPath("$.data.active").value(true));

        // Verify the service was saved to the database
        List<Service> services = serviceRepository.findByProviderId(providerUser.getId());
        assertEquals(2, services.size());
        assertTrue(services.stream().anyMatch(s -> s.getName().equals("New Service")));
    }

    @Test
    void createService_AsClient_ReturnsForbidden() throws Exception {
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setName("Unauthorized Service");
        serviceDTO.setDurationMinutes(30);
        serviceDTO.setPrice(49.99);

        mockMvc.perform(post("/api/services/provider/" + providerUser.getId())
                        .header("Authorization", clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(serviceDTO)))
                .andExpect(status().isForbidden());

        // Verify no new service was created
        List<Service> services = serviceRepository.findAll();
        assertEquals(1, services.size());
    }

    @Test
    void updateService_AsProvider_UpdatesService() throws Exception {
        ServiceDTO updateDTO = new ServiceDTO();
        updateDTO.setName("Updated Service");
        updateDTO.setDescription("This service has been updated");
        updateDTO.setDurationMinutes(45);
        updateDTO.setPrice(79.99);

        mockMvc.perform(put("/api/services/" + testService.getId())
                        .header("Authorization", providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(testService.getId()))
                .andExpect(jsonPath("$.data.name").value("Updated Service"))
                .andExpect(jsonPath("$.data.description").value("This service has been updated"))
                .andExpect(jsonPath("$.data.durationMinutes").value(45))
                .andExpect(jsonPath("$.data.price").value(79.99));

        // Verify the service was updated in the database
        Service updatedService = serviceRepository.findById(testService.getId()).orElseThrow();
        assertEquals("Updated Service", updatedService.getName());
        assertEquals("This service has been updated", updatedService.getDescription());
        assertEquals(45, updatedService.getDurationMinutes());
        assertEquals(79.99, updatedService.getPrice());
    }

    @Test
    void updateService_AsAdmin_UpdatesService() throws Exception {
        ServiceDTO updateDTO = new ServiceDTO();
        updateDTO.setName("Admin Updated");
        updateDTO.setPrice(199.99);

        mockMvc.perform(put("/api/services/" + testService.getId())
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Admin Updated"))
                .andExpect(jsonPath("$.data.price").value(199.99));

        // Verify the service was updated in the database
        Service updatedService = serviceRepository.findById(testService.getId()).orElseThrow();
        assertEquals("Admin Updated", updatedService.getName());
        assertEquals(199.99, updatedService.getPrice());
    }

    @Test
    void updateService_AsOtherProvider_ReturnsForbidden() throws Exception {
        // Create another provider and get token
        createTestUser("other@provider.com", "Other", "Provider", "ROLE_PROVIDER", "PROVIDER");
        String otherProviderToken = getAuthToken("other@provider.com", "password");

        ServiceDTO updateDTO = new ServiceDTO();
        updateDTO.setName("Unauthorized Update");

        mockMvc.perform(put("/api/services/" + testService.getId())
                        .header("Authorization", otherProviderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isForbidden());

        // Verify the service was not updated
        Service unchangedService = serviceRepository.findById(testService.getId()).orElseThrow();
        assertEquals(testService.getName(), unchangedService.getName());
    }

    @Test
    void deleteService_AsProvider_DeletesService() throws Exception {
        mockMvc.perform(delete("/api/services/" + testService.getId())
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the service was deleted
        assertTrue(serviceRepository.findById(testService.getId()).isEmpty());
    }

    @Test
    void activateService_AsProvider_ActivatesService() throws Exception {
        // First deactivate the service
        testService.setActive(false);
        serviceRepository.save(testService);

        mockMvc.perform(put("/api/services/" + testService.getId() + "/activate")
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the service was activated
        Service activatedService = serviceRepository.findById(testService.getId()).orElseThrow();
        assertTrue(activatedService.isActive());
    }

    @Test
    void deactivateService_AsProvider_DeactivatesService() throws Exception {
        mockMvc.perform(put("/api/services/" + testService.getId() + "/deactivate")
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the service was deactivated
        Service deactivatedService = serviceRepository.findById(testService.getId()).orElseThrow();
        assertTrue(!deactivatedService.isActive());
    }
}