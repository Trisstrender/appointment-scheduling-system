package VoidSystems.appointment_service.dto.user;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String role;
    private String userType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for providers
    private String title;
    private String description;
    
    // Additional fields for admins
    private Boolean superAdmin;
}