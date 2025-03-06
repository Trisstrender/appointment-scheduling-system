package VoidSystems.appointment_service.mapper;

import VoidSystems.appointment_service.domain.model.Notification;
import VoidSystems.appointment_service.dto.NotificationDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationMapper {

    private final ObjectMapper objectMapper;

    public NotificationDTO toDTO(Notification notification) {
        Map<String, Object> data = null;
        if (notification.getData() != null && !notification.getData().isEmpty()) {
            try {
                data = objectMapper.readValue(notification.getData(), new TypeReference<Map<String, Object>>() {});
            } catch (JsonProcessingException e) {
                log.error("Error parsing notification data JSON", e);
            }
        }

        return NotificationDTO.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .data(data)
                .build();
    }
} 