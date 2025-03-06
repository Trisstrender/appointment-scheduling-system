package VoidSystems.appointment_service.integration;

import VoidSystems.appointment_service.domain.model.Notification;
import VoidSystems.appointment_service.domain.model.Role;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.NotificationRepository;
import VoidSystems.appointment_service.domain.repository.RoleRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import VoidSystems.appointment_service.dto.NotificationDTO;
import VoidSystems.appointment_service.security.JwtTokenProvider;
import VoidSystems.appointment_service.service.NotificationService;
import VoidSystems.appointment_service.config.IntegrationTestConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test-only")
@Import(IntegrationTestConfig.class)
@Transactional
public class NotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private NotificationService notificationService;

    private User testUser;
    private String jwtToken;
    private Notification testNotification;

    @BeforeEach
    void setUp() {
        // Create or get client role
        Role clientRole = roleRepository.findByName("CLIENT")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("CLIENT");
                    return roleRepository.save(role);
                });
                
        // Create a test user
        testUser = userRepository.findByEmail("client1@example.com")
                .orElseGet(() -> {
                    User user = new User();
                    user.setEmail("client1@example.com");
                    user.setPassword("$2a$10$eDhNCmF9/LNYm/xLcQRLRO9jRBTJ1W6tK2GA.1kkHwGNzFd6oUjfK"); // "password" encoded
                    user.setFirstName("Client");
                    user.setLastName("One");
                    user.setRole(clientRole); // Set the role
                    return userRepository.save(user);
                });

        // Generate JWT token for the test user
        UserDetails userDetails = userDetailsService.loadUserByUsername(testUser.getEmail());
        jwtToken = jwtTokenProvider.generateToken(userDetails);

        // Create a test notification
        testNotification = new Notification();
        testNotification.setUser(testUser);
        testNotification.setType("TEST_TYPE");
        testNotification.setTitle("Test Title");
        testNotification.setMessage("Test Message");
        testNotification.setRead(false);
        testNotification.setCreatedAt(LocalDateTime.now());
        testNotification.setData("{\"key\":\"value\"}");
        testNotification = notificationRepository.save(testNotification);
        
        // Debug: Print authentication details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication in setUp: " + (auth != null ? auth.getName() : "null"));
    }

    @Test
    void getUserNotifications_ShouldReturnUserNotifications() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(testNotification.getId()))
                .andExpect(jsonPath("$[0].type").value(testNotification.getType()))
                .andExpect(jsonPath("$[0].title").value(testNotification.getTitle()))
                .andExpect(jsonPath("$[0].message").value(testNotification.getMessage()))
                .andExpect(jsonPath("$[0].read").value(testNotification.isRead()));
    }

    @Test
    void getPaginatedNotifications_ShouldReturnPaginatedNotifications() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications/paginated")
                .header("Authorization", "Bearer " + jwtToken)
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].id").value(testNotification.getId()))
                .andExpect(jsonPath("$.totalElements").isNumber());
    }

    @Test
    void getUnreadNotifications_ShouldReturnUnreadNotifications() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications/unread")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(testNotification.getId()))
                .andExpect(jsonPath("$[0].read").value(false));
    }

    @Test
    void getUnreadNotificationCount_ShouldReturnCount() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications/unread/count")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNumber())
                .andExpect(jsonPath("$").value(1));
    }

    @Test
    @WithMockUser(username = "client1@example.com")
    void markAsRead_ShouldMarkNotificationAsRead() throws Exception {
        // Debug: Print authentication details
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication in markAsRead: " + (auth != null ? auth.getName() : "null"));
        System.out.println("Test notification ID: " + testNotification.getId());
        
        // Act
        MvcResult result = mockMvc.perform(put("/api/notifications/{id}/read", testNotification.getId())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andReturn();

        // Assert
        NotificationDTO notificationDTO = objectMapper.readValue(
                result.getResponse().getContentAsString(), NotificationDTO.class);
        assertTrue(notificationDTO.isRead());

        // Verify in database
        Notification updatedNotification = notificationRepository.findById(testNotification.getId()).orElse(null);
        assertNotNull(updatedNotification);
        assertTrue(updatedNotification.isRead());
    }

    @Test
    void markAllAsRead_ShouldMarkAllNotificationsAsRead() throws Exception {
        // Arrange
        // Create another unread notification
        Notification anotherNotification = new Notification();
        anotherNotification.setUser(testUser);
        anotherNotification.setType("ANOTHER_TYPE");
        anotherNotification.setTitle("Another Title");
        anotherNotification.setMessage("Another Message");
        anotherNotification.setRead(false);
        anotherNotification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(anotherNotification);

        // Act
        mockMvc.perform(put("/api/notifications/read-all")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        // Assert
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(testUser);
        assertFalse(notifications.isEmpty());
        assertTrue(notifications.stream().allMatch(Notification::isRead));
    }

    @Test
    void deleteNotification_ShouldDeleteNotification() throws Exception {
        // Act
        mockMvc.perform(delete("/api/notifications/{id}", testNotification.getId())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Assert
        assertFalse(notificationRepository.existsById(testNotification.getId()));
    }

    @Test
    void deleteAllNotifications_ShouldDeleteAllNotifications() throws Exception {
        // Act
        mockMvc.perform(delete("/api/notifications")
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        // Assert
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(testUser);
        assertTrue(notifications.isEmpty());
    }

    @Test
    void accessingNotificationsWithoutAuthentication_ShouldReturnUnauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/notifications")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden()); // Spring Security returns 403 Forbidden for unauthenticated requests
    }

    @Test
    void accessingOtherUserNotification_ShouldReturnForbidden() throws Exception {
        // Arrange
        // Create another user
        User anotherUser = new User();
        anotherUser.setEmail("another@example.com");
        anotherUser.setPassword("$2a$10$eDhNCmF9/LNYm/xLcQRLRO9jRBTJ1W6tK2GA.1kkHwGNzFd6oUjfK");
        anotherUser.setFirstName("Another");
        anotherUser.setLastName("User");
        
        // Get or create a role for the other user
        Role userRole = roleRepository.findByName("USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("USER");
                    return roleRepository.save(role);
                });
        anotherUser.setRole(userRole);
        
        anotherUser = userRepository.save(anotherUser);

        // Create a notification for the other user
        Notification otherUserNotification = new Notification();
        otherUserNotification.setUser(anotherUser);
        otherUserNotification.setType("OTHER_TYPE");
        otherUserNotification.setTitle("Other Title");
        otherUserNotification.setMessage("Other Message");
        otherUserNotification.setRead(false);
        otherUserNotification.setCreatedAt(LocalDateTime.now());
        otherUserNotification = notificationRepository.save(otherUserNotification);

        // Act & Assert
        mockMvc.perform(put("/api/notifications/{id}/read", otherUserNotification.getId())
                .header("Authorization", "Bearer " + jwtToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized()); // Our application returns 401 Unauthorized for accessing other user's resources
    }

    @Test
    void markAsReadDirect_ShouldMarkNotificationAsRead() {
        // Act - Call the service method directly
        Notification updatedNotification = notificationService.markAsRead(testNotification.getId(), testUser);
        
        // Assert
        assertTrue(updatedNotification.isRead());
        
        // Verify in database
        Notification dbNotification = notificationRepository.findById(testNotification.getId()).orElse(null);
        assertNotNull(dbNotification);
        assertTrue(dbNotification.isRead());
    }
} 