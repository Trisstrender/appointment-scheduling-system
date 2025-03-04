package VoidSystems.appointment_service.integration;

import VoidSystems.appointment_service.dto.AvailabilityDTO;
import VoidSystems.appointment_service.dto.auth.AuthRequest;
import VoidSystems.appointment_service.dto.auth.AuthResponse;
import VoidSystems.appointment_service.model.Availability;
import VoidSystems.appointment_service.model.User;
import VoidSystems.appointment_service.repository.AvailabilityRepository;
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

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
// import java.time.format.DateTimeFormatter; // Not used
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AvailabilityControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AvailabilityRepository availabilityRepository;

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
    private Availability recurringAvailability;
    private Availability specificDateAvailability;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up the database before each test
        availabilityRepository.deleteAll();
        userRepository.deleteAll();

        // Create test users
        adminUser = createTestUser("admin@test.com", "Admin", "User", "ROLE_ADMIN", "ADMIN");
        providerUser = createTestUser("provider@test.com", "Provider", "User", "ROLE_PROVIDER", "PROVIDER");
        clientUser = createTestUser("client@test.com", "Client", "User", "ROLE_CLIENT", "CLIENT");

        // Get authentication tokens
        adminToken = getAuthToken("admin@test.com", "password");
        providerToken = getAuthToken("provider@test.com", "password");
        clientToken = getAuthToken("client@test.com", "password");

        // Create test availabilities
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(17, 0);
        
        // Recurring availability (every Monday)
        recurringAvailability = createRecurringAvailability(
                providerUser.getId(),
                DayOfWeek.MONDAY.getValue(),
                startTime,
                endTime
        );
        
        // Specific date availability (tomorrow)
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        specificDateAvailability = createSpecificDateAvailability(
                providerUser.getId(),
                tomorrow,
                startTime,
                endTime
        );
    }

    @AfterEach
    void tearDown() {
        availabilityRepository.deleteAll();
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

    private Availability createRecurringAvailability(Long providerId, int dayOfWeek, LocalTime startTime, LocalTime endTime) {
        Availability availability = new Availability();
        availability.setProviderId(providerId);
        availability.setRecurring(true);
        availability.setDayOfWeek(dayOfWeek);
        availability.setStartTime(startTime.atDate(LocalDate.now()));
        availability.setEndTime(endTime.atDate(LocalDate.now()));
        return availabilityRepository.save(availability);
    }

    private Availability createSpecificDateAvailability(Long providerId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        Availability availability = new Availability();
        availability.setProviderId(providerId);
        availability.setRecurring(false);
        availability.setSpecificDate(date);
        availability.setStartTime(startTime.atDate(date));
        availability.setEndTime(endTime.atDate(date));
        return availabilityRepository.save(availability);
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
    void getAllAvailabilities_AsAdmin_ReturnsAllAvailabilities() throws Exception {
        mockMvc.perform(get("/api/availabilities")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].providerId", containsInAnyOrder(
                        providerUser.getId().intValue(),
                        providerUser.getId().intValue()
                )));
    }

    @Test
    void getAvailabilityById_AsProvider_ReturnsAvailability() throws Exception {
        mockMvc.perform(get("/api/availabilities/" + recurringAvailability.getId())
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(recurringAvailability.getId()))
                .andExpect(jsonPath("$.data.providerId").value(providerUser.getId()))
                .andExpect(jsonPath("$.data.recurring").value(true))
                .andExpect(jsonPath("$.data.dayOfWeek").value(DayOfWeek.MONDAY.getValue()));
    }

    @Test
    void getAvailabilitiesByProviderId_ReturnsProviderAvailabilities() throws Exception {
        mockMvc.perform(get("/api/availabilities/provider/" + providerUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].providerId", everyItem(is(providerUser.getId().intValue()))));
    }

    @Test
    void createAvailability_AsProvider_CreatesAvailability() throws Exception {
        AvailabilityDTO availabilityDTO = new AvailabilityDTO();
        availabilityDTO.setRecurring(true);
        availabilityDTO.setDayOfWeek(DayOfWeek.WEDNESDAY.getValue());
        availabilityDTO.setStartTime(LocalDateTime.of(LocalDate.now(), LocalTime.of(10, 0)));
        availabilityDTO.setEndTime(LocalDateTime.of(LocalDate.now(), LocalTime.of(18, 0)));

        mockMvc.perform(post("/api/availabilities/provider/" + providerUser.getId())
                        .header("Authorization", providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availabilityDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.providerId").value(providerUser.getId()))
                .andExpect(jsonPath("$.data.recurring").value(true))
                .andExpect(jsonPath("$.data.dayOfWeek").value(DayOfWeek.WEDNESDAY.getValue()));

        // Verify the availability was saved to the database
        List<Availability> availabilities = availabilityRepository.findByProviderId(providerUser.getId());
        assertEquals(3, availabilities.size());
        assertTrue(availabilities.stream().anyMatch(a -> a.getDayOfWeek() == DayOfWeek.WEDNESDAY.getValue()));
    }

    @Test
    void createAvailability_AsClient_ReturnsForbidden() throws Exception {
        AvailabilityDTO availabilityDTO = new AvailabilityDTO();
        availabilityDTO.setRecurring(true);
        availabilityDTO.setDayOfWeek(DayOfWeek.FRIDAY.getValue());
        availabilityDTO.setStartTime(LocalDateTime.now());
        availabilityDTO.setEndTime(LocalDateTime.now().plusHours(8));

        mockMvc.perform(post("/api/availabilities/provider/" + providerUser.getId())
                        .header("Authorization", clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(availabilityDTO)))
                .andExpect(status().isForbidden());

        // Verify no new availability was created
        List<Availability> availabilities = availabilityRepository.findAll();
        assertEquals(2, availabilities.size());
    }

    @Test
    void updateAvailability_AsProvider_UpdatesAvailability() throws Exception {
        AvailabilityDTO updateDTO = new AvailabilityDTO();
        updateDTO.setStartTime(LocalDateTime.of(LocalDate.now(), LocalTime.of(8, 0)));
        updateDTO.setEndTime(LocalDateTime.of(LocalDate.now(), LocalTime.of(16, 0)));

        mockMvc.perform(put("/api/availabilities/" + recurringAvailability.getId())
                        .header("Authorization", providerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(recurringAvailability.getId()))
                .andExpect(jsonPath("$.data.startTime").value(containsString("08:00")))
                .andExpect(jsonPath("$.data.endTime").value(containsString("16:00")));

        // Verify the availability was updated in the database
        Availability updatedAvailability = availabilityRepository.findById(recurringAvailability.getId()).orElseThrow();
        assertEquals(8, updatedAvailability.getStartTime().getHour());
        assertEquals(16, updatedAvailability.getEndTime().getHour());
    }

    @Test
    void deleteAvailability_AsProvider_DeletesAvailability() throws Exception {
        mockMvc.perform(delete("/api/availabilities/" + specificDateAvailability.getId())
                        .header("Authorization", providerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the availability was deleted
        assertTrue(availabilityRepository.findById(specificDateAvailability.getId()).isEmpty());
    }

    @Test
    void deleteAvailability_AsOtherProvider_ReturnsForbidden() throws Exception {
        // Create another provider and get token
        createTestUser("other@provider.com", "Other", "Provider", "ROLE_PROVIDER", "PROVIDER");
        String otherProviderToken = getAuthToken("other@provider.com", "password");

        mockMvc.perform(delete("/api/availabilities/" + specificDateAvailability.getId())
                        .header("Authorization", otherProviderToken))
                .andExpect(status().isForbidden());

        // Verify the availability was not deleted
        assertTrue(availabilityRepository.findById(specificDateAvailability.getId()).isPresent());
    }
}