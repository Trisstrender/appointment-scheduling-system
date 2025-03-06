package VoidSystems.appointment_service.service.impl;

import VoidSystems.appointment_service.domain.model.Notification;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.NotificationRepository;
import VoidSystems.appointment_service.exception.ResourceNotFoundException;
import VoidSystems.appointment_service.exception.UnauthorizedException;
import VoidSystems.appointment_service.service.NotificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public Notification createNotification(User user, String type, String title, String message, Map<String, Object> data) {
        String jsonData = null;
        if (data != null) {
            try {
                jsonData = objectMapper.writeValueAsString(data);
            } catch (JsonProcessingException e) {
                log.error("Error converting notification data to JSON", e);
            }
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .read(false)
                .data(jsonData)
                .build();

        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(User user) {
        return notificationRepository.countUnreadNotifications(user);
    }

    @Override
    @Transactional
    public Notification markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to access this notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsRead(user);
        
        // Verify that all notifications are marked as read
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        if (!notifications.isEmpty() && !notifications.stream().allMatch(Notification::isRead)) {
            // If not all notifications are marked as read, update them individually
            for (Notification notification : notifications) {
                if (!notification.isRead()) {
                    notification.setRead(true);
                    notificationRepository.save(notification);
                }
            }
        }
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this notification");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void deleteAllNotifications(User user) {
        notificationRepository.deleteAllByUser(user);
    }

    @Override
    @Transactional
    public Notification createAppointmentConfirmationNotification(User user, Long appointmentId, String serviceName, String dateTime) {
        String title = "Appointment Confirmed";
        String message = "Your appointment for " + serviceName + " on " + dateTime + " has been confirmed.";
        
        Map<String, Object> data = new HashMap<>();
        data.put("appointmentId", appointmentId);
        data.put("serviceName", serviceName);
        data.put("dateTime", dateTime);
        
        return createNotification(user, "APPOINTMENT_CONFIRMED", title, message, data);
    }

    @Override
    @Transactional
    public Notification createAppointmentCancellationNotification(User user, Long appointmentId, String serviceName, String dateTime) {
        String title = "Appointment Cancelled";
        String message = "Your appointment for " + serviceName + " on " + dateTime + " has been cancelled.";
        
        Map<String, Object> data = new HashMap<>();
        data.put("appointmentId", appointmentId);
        data.put("serviceName", serviceName);
        data.put("dateTime", dateTime);
        
        return createNotification(user, "APPOINTMENT_CANCELLED", title, message, data);
    }

    @Override
    @Transactional
    public Notification createAppointmentReminderNotification(User user, Long appointmentId, String serviceName, String dateTime) {
        String title = "Upcoming Appointment";
        String message = "Reminder: You have an appointment for " + serviceName + " on " + dateTime + ".";
        
        Map<String, Object> data = new HashMap<>();
        data.put("appointmentId", appointmentId);
        data.put("serviceName", serviceName);
        data.put("dateTime", dateTime);
        
        return createNotification(user, "APPOINTMENT_REMINDER", title, message, data);
    }

    @Override
    @Transactional
    public Notification createNewAppointmentNotification(User provider, Long appointmentId, String clientName, String serviceName, String dateTime) {
        String title = "New Appointment";
        String message = "New appointment request from " + clientName + " for " + serviceName + " on " + dateTime + ".";
        
        Map<String, Object> data = new HashMap<>();
        data.put("appointmentId", appointmentId);
        data.put("clientName", clientName);
        data.put("serviceName", serviceName);
        data.put("dateTime", dateTime);
        
        return createNotification(provider, "NEW_APPOINTMENT", title, message, data);
    }
} 