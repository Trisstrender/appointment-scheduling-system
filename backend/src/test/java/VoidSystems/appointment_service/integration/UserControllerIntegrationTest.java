package VoidSystems.appointment_service.integration;

import VoidSystems.appointment_service.dto.UserDTO;
import VoidSystems.appointment_service.dto.auth.AuthRequest;
import VoidSystems.appointment_service.dto.auth.AuthResponse;
import VoidSystems.appointment_service.model.User;
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

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private String adminToken;
    private String clientToken;
    // Used in potential future tests
    @SuppressWarnings("unused")
    private String providerToken;
    private User adminUser;
    private User clientUser;
    private User providerUser;

    @BeforeEach
    void setUp() throws Exception {
        // Clean up the database before each test
        userRepository.deleteAll();

        // Create test users
        adminUser = createTestUser("admin@test.com", "Admin", "User", "ROLE_ADMIN", "ADMIN");
        clientUser = createTestUser("client@test.com", "Client", "User", "ROLE_CLIENT", "CLIENT");
        providerUser = createTestUser("provider@test.com", "Provider", "User", "ROLE_PROVIDER", "PROVIDER");

        // Get authentication tokens
        adminToken = getAuthToken("admin@test.com", "password");
        clientToken = getAuthToken("client@test.com", "password");
        providerToken = getAuthToken("provider@test.com", "password");
    }

    @AfterEach
    void tearDown() {
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
    void getAllUsers_AsAdmin_ReturnsAllUsers() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(3)))
                .andExpect(jsonPath("$.data[*].email", containsInAnyOrder(
                        adminUser.getEmail(),
                        clientUser.getEmail(),
                        providerUser.getEmail()
                )));
    }

    @Test
    void getAllUsers_AsClient_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/users")
                        .header("Authorization", clientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getUserById_AsAdmin_ReturnsUser() throws Exception {
        mockMvc.perform(get("/api/users/" + clientUser.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(clientUser.getId()))
                .andExpect(jsonPath("$.data.email").value(clientUser.getEmail()))
                .andExpect(jsonPath("$.data.firstName").value(clientUser.getFirstName()))
                .andExpect(jsonPath("$.data.lastName").value(clientUser.getLastName()))
                .andExpect(jsonPath("$.data.userType").value(clientUser.getUserType()));
    }

    @Test
    void getUserById_AsOwner_ReturnsUser() throws Exception {
        mockMvc.perform(get("/api/users/" + clientUser.getId())
                        .header("Authorization", clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(clientUser.getId()))
                .andExpect(jsonPath("$.data.email").value(clientUser.getEmail()));
    }

    @Test
    void getUserById_AsOtherUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/users/" + adminUser.getId())
                        .header("Authorization", clientToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCurrentUser_ReturnsCurrentUser() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(clientUser.getId()))
                .andExpect(jsonPath("$.data.email").value(clientUser.getEmail()))
                .andExpect(jsonPath("$.data.firstName").value(clientUser.getFirstName()))
                .andExpect(jsonPath("$.data.lastName").value(clientUser.getLastName()))
                .andExpect(jsonPath("$.data.userType").value(clientUser.getUserType()));
    }

    @Test
    void getAllClients_AsAdmin_ReturnsAllClients() throws Exception {
        mockMvc.perform(get("/api/users/clients")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].email").value(clientUser.getEmail()))
                .andExpect(jsonPath("$.data[0].userType").value("CLIENT"));
    }

    @Test
    void getAllProviders_AsAdmin_ReturnsAllProviders() throws Exception {
        mockMvc.perform(get("/api/users/providers")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].email").value(providerUser.getEmail()))
                .andExpect(jsonPath("$.data[0].userType").value("PROVIDER"));
    }

    @Test
    void updateUser_AsAdmin_UpdatesUser() throws Exception {
        UserDTO updateDTO = new UserDTO();
        updateDTO.setFirstName("Updated");
        updateDTO.setLastName("Name");
        updateDTO.setPhoneNumber("123-456-7890");

        mockMvc.perform(put("/api/users/" + clientUser.getId())
                        .header("Authorization", adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Updated"))
                .andExpect(jsonPath("$.data.lastName").value("Name"))
                .andExpect(jsonPath("$.data.phoneNumber").value("123-456-7890"));

        // Verify the changes were saved to the database
        User updatedUser = userRepository.findById(clientUser.getId()).orElseThrow();
        assertEquals("Updated", updatedUser.getFirstName());
        assertEquals("Name", updatedUser.getLastName());
        assertEquals("123-456-7890", updatedUser.getPhoneNumber());
    }

    @Test
    void updateUser_AsOwner_UpdatesUser() throws Exception {
        UserDTO updateDTO = new UserDTO();
        updateDTO.setFirstName("Self");
        updateDTO.setLastName("Updated");
        updateDTO.setPhoneNumber("987-654-3210");

        mockMvc.perform(put("/api/users/" + clientUser.getId())
                        .header("Authorization", clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.firstName").value("Self"))
                .andExpect(jsonPath("$.data.lastName").value("Updated"))
                .andExpect(jsonPath("$.data.phoneNumber").value("987-654-3210"));

        // Verify the changes were saved to the database
        User updatedUser = userRepository.findById(clientUser.getId()).orElseThrow();
        assertEquals("Self", updatedUser.getFirstName());
        assertEquals("Updated", updatedUser.getLastName());
        assertEquals("987-654-3210", updatedUser.getPhoneNumber());
    }

    @Test
    void updateUser_AsOtherUser_ReturnsForbidden() throws Exception {
        UserDTO updateDTO = new UserDTO();
        updateDTO.setFirstName("Hacker");
        updateDTO.setLastName("Attempt");

        mockMvc.perform(put("/api/users/" + adminUser.getId())
                        .header("Authorization", clientToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isForbidden());

        // Verify the user was not changed
        User unchangedUser = userRepository.findById(adminUser.getId()).orElseThrow();
        assertEquals(adminUser.getFirstName(), unchangedUser.getFirstName());
        assertEquals(adminUser.getLastName(), unchangedUser.getLastName());
    }

    @Test
    void activateUser_AsAdmin_ActivatesUser() throws Exception {
        // First deactivate the user
        clientUser.setActive(false);
        userRepository.save(clientUser);

        mockMvc.perform(put("/api/users/" + clientUser.getId() + "/activate")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the user was activated
        User activatedUser = userRepository.findById(clientUser.getId()).orElseThrow();
        assertTrue(activatedUser.isActive());
    }

    @Test
    void deactivateUser_AsAdmin_DeactivatesUser() throws Exception {
        mockMvc.perform(put("/api/users/" + clientUser.getId() + "/deactivate")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the user was deactivated
        User deactivatedUser = userRepository.findById(clientUser.getId()).orElseThrow();
        assertTrue(!deactivatedUser.isActive());
    }

    @Test
    void deleteUser_AsAdmin_DeletesUser() throws Exception {
        mockMvc.perform(delete("/api/users/" + clientUser.getId())
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Verify the user was deleted
        List<User> remainingUsers = userRepository.findAll();
        assertEquals(2, remainingUsers.size());
        assertTrue(remainingUsers.stream().noneMatch(u -> u.getId().equals(clientUser.getId())));
    }

    @Test
    void deleteUser_AsOwner_ReturnsForbidden() throws Exception {
        mockMvc.perform(delete("/api/users/" + clientUser.getId())
                        .header("Authorization", clientToken))
                .andExpect(status().isForbidden());

        // Verify the user was not deleted
        assertTrue(userRepository.existsById(clientUser.getId()));
    }
}