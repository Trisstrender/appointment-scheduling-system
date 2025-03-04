package VoidSystems.appointment_service.service;

import VoidSystems.appointment_service.dto.auth.JwtAuthenticationResponse;
import VoidSystems.appointment_service.dto.auth.LoginRequest;
import VoidSystems.appointment_service.dto.auth.RegisterRequest;

public interface AuthService {
    
    JwtAuthenticationResponse login(LoginRequest loginRequest);
    
    JwtAuthenticationResponse register(RegisterRequest registerRequest);
}