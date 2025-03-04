package VoidSystems.appointment_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import VoidSystems.appointment_service.dto.auth.JwtAuthenticationResponse;
import VoidSystems.appointment_service.dto.auth.LoginRequest;
import VoidSystems.appointment_service.dto.auth.RegisterRequest;
import VoidSystems.appointment_service.dto.common.ApiResponse;
import VoidSystems.appointment_service.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtAuthenticationResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("User logged in successfully", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtAuthenticationResponse>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        JwtAuthenticationResponse response = authService.register(registerRequest);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }
}