package VoidSystems.appointment_service.service;

import java.util.List;

import VoidSystems.appointment_service.dto.user.UserDTO;

public interface UserService {
    
    UserDTO getCurrentUser();
    
    UserDTO getUserById(Long id);
    
    UserDTO getUserByEmail(String email);
    
    List<UserDTO> getAllUsers();
    
    List<UserDTO> getAllClients();
    
    List<UserDTO> getAllProviders();
    
    UserDTO updateUser(Long id, UserDTO userDTO);
    
    void deleteUser(Long id);
    
    boolean existsByEmail(String email);
}