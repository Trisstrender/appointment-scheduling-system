package VoidSystems.appointment_service.controller;

import VoidSystems.appointment_service.domain.model.Notification;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.dto.NotificationDTO;
import VoidSystems.appointment_service.exception.UnauthorizedException;
import VoidSystems.appointment_service.mapper.NotificationMapper;
import VoidSystems.appointment_service.security.CurrentUser;
import VoidSystems.appointment_service.security.CustomUserDetailsService;
import VoidSystems.appointment_service.service.NotificationService;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Notification management APIs")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get all notifications for the current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        List<Notification> notifications = notificationService.getUserNotifications(user);
        List<NotificationDTO> notificationDTOs = notifications.stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notificationDTOs);
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get paginated notifications for the current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<NotificationDTO>> getPaginatedNotifications(
            @CurrentUser User user,
            Pageable pageable) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        Page<Notification> notificationsPage = notificationService.getUserNotifications(user, pageable);
        return ResponseEntity.ok(notificationsPage.map(notificationMapper::toDTO));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications for the current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        List<Notification> notifications = notificationService.getUnreadNotifications(user);
        List<NotificationDTO> notificationDTOs = notifications.stream()
                .map(notificationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notificationDTOs);
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get the count of unread notifications for the current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> getUnreadNotificationCount(@CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        long count = notificationService.getUnreadNotificationCount(user);
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id, @CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        Notification notification = notificationService.markAsRead(id, user);
        return ResponseEntity.ok(notificationMapper.toDTO(notification));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read for the current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAllAsRead(@CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        notificationService.markAllAsRead(user);
        
        // Return all notifications to verify they're marked as read
        List<Notification> notifications = notificationService.getUserNotifications(user);
        if (!notifications.stream().allMatch(Notification::isRead)) {
            // If not all notifications are marked as read, log a warning
            logger.warn("Not all notifications were marked as read for user {}", user.getId());
        }
        
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a notification")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable("id") Long notificationId,
            @CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        notificationService.deleteNotification(notificationId, user);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Delete all notifications for the current user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteAllNotifications(@CurrentUser User user) {
        if (user == null) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
                String email = ((UserDetails) authentication.getPrincipal()).getUsername();
                try {
                    // We need to get the actual User entity from the repository
                    user = userRepository.findByEmail(email)
                            .orElseThrow(() -> new UnauthorizedException("User not found"));
                } catch (Exception e) {
                    throw new UnauthorizedException("User not found");
                }
            }
            
            if (user == null) {
                throw new UnauthorizedException("Authentication required");
            }
        }
        
        notificationService.deleteAllNotifications(user);
        return ResponseEntity.noContent().build();
    }
} 