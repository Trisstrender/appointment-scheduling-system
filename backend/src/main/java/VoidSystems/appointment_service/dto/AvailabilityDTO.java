package VoidSystems.appointment_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {
    
    private Long id;
    
    private Long providerId;
    
    private String providerName;
    
    private boolean recurring = false;
    
    private Integer dayOfWeek;
    
    private LocalDate specificDate;
    
    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;
    
    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
}