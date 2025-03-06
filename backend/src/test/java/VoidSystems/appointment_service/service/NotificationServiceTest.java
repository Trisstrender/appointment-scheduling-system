package VoidSystems.appointment_service.service;

import VoidSystems.appointment_service.domain.model.Notification;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.NotificationRepository;
import VoidSystems.appointment_service.exception.ResourceNotFoundException;
import VoidSystems.appointment_service.exception.UnauthorizedException;
import VoidSystems.appointment_service.service.impl.NotificationServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User user;
    private Notification notification;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");

        notification = new Notification();
        notification.setId(1L);
        notification.setUser(user);
        notification.setType("TEST_TYPE");
        notification.setTitle("Test Title");
        notification.setMessage("Test Message");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setData("{\"key\":\"value\"}");
    }

    @Test
    void createNotification_ShouldCreateAndReturnNotification() throws JsonProcessingException {
        // Arrange
        Map<String, Object> data = new HashMap<>();
        data.put("key", "value");
        String jsonData = "{\"key\":\"value\"}";
        
        when(objectMapper.writeValueAsString(data)).thenReturn(jsonData);
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        Notification result = notificationService.createNotification(user, "TEST_TYPE", "Test Title", "Test Message", data);

        // Assert
        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        assertEquals(notification.getType(), result.getType());
        assertEquals(notification.getTitle(), result.getTitle());
        assertEquals(notification.getMessage(), result.getMessage());
        assertEquals(notification.getData(), result.getData());
        
        verify(objectMapper).writeValueAsString(data);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void getUserNotifications_ShouldReturnUserNotifications() {
        // Arrange
        List<Notification> notifications = Collections.singletonList(notification);
        when(notificationRepository.findByUserOrderByCreatedAtDesc(user)).thenReturn(notifications);

        // Act
        List<Notification> result = notificationService.getUserNotifications(user);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(notification.getId(), result.get(0).getId());
        
        verify(notificationRepository).findByUserOrderByCreatedAtDesc(user);
    }

    @Test
    void getUserNotificationsPaginated_ShouldReturnPaginatedUserNotifications() {
        // Arrange
        List<Notification> notifications = Collections.singletonList(notification);
        Page<Notification> page = new PageImpl<>(notifications);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable)).thenReturn(page);

        // Act
        Page<Notification> result = notificationService.getUserNotifications(user, pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(notification.getId(), result.getContent().get(0).getId());
        
        verify(notificationRepository).findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Test
    void getUnreadNotifications_ShouldReturnUnreadNotifications() {
        // Arrange
        List<Notification> notifications = Collections.singletonList(notification);
        when(notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false)).thenReturn(notifications);

        // Act
        List<Notification> result = notificationService.getUnreadNotifications(user);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(notification.getId(), result.get(0).getId());
        assertFalse(result.get(0).isRead());
        
        verify(notificationRepository).findByUserAndReadOrderByCreatedAtDesc(user, false);
    }

    @Test
    void getUnreadNotificationCount_ShouldReturnCount() {
        // Arrange
        when(notificationRepository.countUnreadNotifications(user)).thenReturn(5L);

        // Act
        long result = notificationService.getUnreadNotificationCount(user);

        // Assert
        assertEquals(5L, result);
        
        verify(notificationRepository).countUnreadNotifications(user);
    }

    @Test
    void markAsRead_ShouldMarkNotificationAsRead() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        
        Notification unreadNotification = new Notification();
        unreadNotification.setId(1L);
        unreadNotification.setUser(user);
        unreadNotification.setRead(false);
        
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(unreadNotification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Notification result = notificationService.markAsRead(1L, user);

        // Assert
        assertNotNull(result);
        assertTrue(result.isRead());
        
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void markAsRead_ShouldThrowResourceNotFoundException_WhenNotificationNotFound() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead(1L, user));
        
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAsRead_ShouldThrowUnauthorizedException_WhenUserDoesNotOwnNotification() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        
        Notification otherUserNotification = new Notification();
        otherUserNotification.setId(1L);
        otherUserNotification.setUser(otherUser);
        
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(otherUserNotification));

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> notificationService.markAsRead(1L, user));
        
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    void markAllAsRead_ShouldCallRepository() {
        // Act
        notificationService.markAllAsRead(user);

        // Assert
        verify(notificationRepository).markAllAsRead(user);
    }

    @Test
    void deleteNotification_ShouldDeleteNotification() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        // Act
        notificationService.deleteNotification(1L, user);

        // Assert
        verify(notificationRepository).findById(1L);
        verify(notificationRepository).delete(notification);
    }

    @Test
    void deleteNotification_ShouldThrowResourceNotFoundException_WhenNotificationNotFound() {
        // Arrange
        when(notificationRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> notificationService.deleteNotification(1L, user));
        
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).delete(any(Notification.class));
    }

    @Test
    void deleteNotification_ShouldThrowUnauthorizedException_WhenUserDoesNotOwnNotification() {
        // Arrange
        User otherUser = new User();
        otherUser.setId(2L);
        
        Notification otherUserNotification = new Notification();
        otherUserNotification.setId(1L);
        otherUserNotification.setUser(otherUser);
        
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(otherUserNotification));

        // Act & Assert
        assertThrows(UnauthorizedException.class, () -> notificationService.deleteNotification(1L, user));
        
        verify(notificationRepository).findById(1L);
        verify(notificationRepository, never()).delete(any(Notification.class));
    }

    @Test
    void deleteAllNotifications_ShouldCallRepository() {
        // Act
        notificationService.deleteAllNotifications(user);

        // Assert
        verify(notificationRepository).deleteAllByUser(user);
    }

    @Test
    void createAppointmentConfirmationNotification_ShouldCreateNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        Notification result = notificationService.createAppointmentConfirmationNotification(user, 1L, "Test Service", "2023-01-01 10:00 AM");

        // Assert
        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createAppointmentCancellationNotification_ShouldCreateNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        Notification result = notificationService.createAppointmentCancellationNotification(user, 1L, "Test Service", "2023-01-01 10:00 AM");

        // Assert
        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createAppointmentReminderNotification_ShouldCreateNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        Notification result = notificationService.createAppointmentReminderNotification(user, 1L, "Test Service", "2023-01-01 10:00 AM");

        // Assert
        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        
        verify(notificationRepository).save(any(Notification.class));
    }

    @Test
    void createNewAppointmentNotification_ShouldCreateNotification() {
        // Arrange
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        // Act
        Notification result = notificationService.createNewAppointmentNotification(user, 1L, "Test Client", "Test Service", "2023-01-01 10:00 AM");

        // Assert
        assertNotNull(result);
        assertEquals(notification.getId(), result.getId());
        
        verify(notificationRepository).save(any(Notification.class));
    }
} 