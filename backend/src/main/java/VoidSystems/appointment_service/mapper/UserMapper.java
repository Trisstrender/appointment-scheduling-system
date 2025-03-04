package VoidSystems.appointment_service.mapper;

import org.springframework.stereotype.Component;

import VoidSystems.appointment_service.domain.model.Admin;
import VoidSystems.appointment_service.domain.model.Client;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.dto.user.UserDTO;

@Component
public class UserMapper {
    
    public UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().getName())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt());
        
        if (user instanceof Client) {
            builder.userType("CLIENT");
        } else if (user instanceof Provider) {
            Provider provider = (Provider) user;
            builder.userType("PROVIDER")
                   .title(provider.getTitle())
                   .description(provider.getDescription());
        } else if (user instanceof Admin) {
            Admin admin = (Admin) user;
            builder.userType("ADMIN")
                   .superAdmin(admin.getSuperAdmin());
        }
        
        return builder.build();
    }
    
    public void updateUserFromDTO(User user, UserDTO userDTO) {
        if (user == null || userDTO == null) {
            return;
        }
        
        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }
        
        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }
        
        if (userDTO.getPhoneNumber() != null) {
            user.setPhoneNumber(userDTO.getPhoneNumber());
        }
        
        if (user instanceof Provider && userDTO.getUserType() != null && userDTO.getUserType().equals("PROVIDER")) {
            Provider provider = (Provider) user;
            
            if (userDTO.getTitle() != null) {
                provider.setTitle(userDTO.getTitle());
            }
            
            if (userDTO.getDescription() != null) {
                provider.setDescription(userDTO.getDescription());
            }
        }
        
        if (user instanceof Admin && userDTO.getUserType() != null && userDTO.getUserType().equals("ADMIN")) {
            Admin admin = (Admin) user;
            
            if (userDTO.getSuperAdmin() != null) {
                admin.setSuperAdmin(userDTO.getSuperAdmin());
            }
        }
    }
}