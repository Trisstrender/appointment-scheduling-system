package VoidSystems.appointment_service.service;

import VoidSystems.appointment_service.domain.model.Notification;
import VoidSystems.appointment_service.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface NotificationService {

    /**
     * Create a new notification for a user
     */
    Notification createNotification(User user, String type, String title, String message, Map<String, Object> data);
    
    /**
     * Get all notifications for a user
     */
    List<Notification> getUserNotifications(User user);
    
    /**
     * Get paginated notifications for a user
     */
    Page<Notification> getUserNotifications(User user, Pageable pageable);
    
    /**
     * Get unread notifications for a user
     */
    List<Notification> getUnreadNotifications(User user);
    
    /**
     * Get the count of unread notifications for a user
     */
    long getUnreadNotificationCount(User user);
    
    /**
     * Mark a notification as read
     */
    Notification markAsRead(Long notificationId, User user);
    
    /**
     * Mark all notifications as read for a user
     */
    void markAllAsRead(User user);
    
    /**
     * Delete a notification
     */
    void deleteNotification(Long notificationId, User user);
    
    /**
     * Delete all notifications for a user
     */
    void deleteAllNotifications(User user);
    
    /**
     * Create an appointment confirmation notification
     */
    Notification createAppointmentConfirmationNotification(User user, Long appointmentId, String serviceName, String dateTime);
    
    /**
     * Create an appointment cancellation notification
     */
    Notification createAppointmentCancellationNotification(User user, Long appointmentId, String serviceName, String dateTime);
    
    /**
     * Create an appointment reminder notification
     */
    Notification createAppointmentReminderNotification(User user, Long appointmentId, String serviceName, String dateTime);
    
    /**
     * Create a new appointment notification for providers
     */
    Notification createNewAppointmentNotification(User provider, Long appointmentId, String clientName, String serviceName, String dateTime);
} 