package VoidSystems.appointment_service.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import VoidSystems.appointment_service.domain.model.Admin;
import VoidSystems.appointment_service.domain.model.Client;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.Role;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.AdminRepository;
import VoidSystems.appointment_service.domain.repository.ClientRepository;
import VoidSystems.appointment_service.domain.repository.ProviderRepository;
import VoidSystems.appointment_service.domain.repository.RoleRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import VoidSystems.appointment_service.dto.auth.JwtAuthenticationResponse;
import VoidSystems.appointment_service.dto.auth.LoginRequest;
import VoidSystems.appointment_service.dto.auth.RegisterRequest;
import VoidSystems.appointment_service.security.JwtTokenProvider;
import VoidSystems.appointment_service.service.AuthService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public JwtAuthenticationResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = tokenProvider.generateToken(userDetails);
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userDetails.getUsername()));
        
        String userType = getUserType(user);

        return JwtAuthenticationResponse.builder()
                .accessToken(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .userType(userType)
                .build();
    }

    @Override
    @Transactional
    public JwtAuthenticationResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }

        Role role = roleRepository.findByName(registerRequest.getRole())
                .orElseThrow(() -> new RuntimeException("Role not found with name: " + registerRequest.getRole()));

        User user;
        String userType;

        // Create user based on role
        if (role.getName().equals("ROLE_CLIENT")) {
            Client client = Client.builder()
                    .email(registerRequest.getEmail())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .role(role)
                    .build();
            
            user = clientRepository.save(client);
            userType = "CLIENT";
        } else if (role.getName().equals("ROLE_PROVIDER")) {
            Provider provider = Provider.builder()
                    .email(registerRequest.getEmail())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .title(registerRequest.getTitle())
                    .description(registerRequest.getDescription())
                    .role(role)
                    .build();
            
            user = providerRepository.save(provider);
            userType = "PROVIDER";
        } else if (role.getName().equals("ROLE_ADMIN")) {
            Admin admin = Admin.builder()
                    .email(registerRequest.getEmail())
                    .password(passwordEncoder.encode(registerRequest.getPassword()))
                    .firstName(registerRequest.getFirstName())
                    .lastName(registerRequest.getLastName())
                    .phoneNumber(registerRequest.getPhoneNumber())
                    .superAdmin(false)
                    .role(role)
                    .build();
            
            user = adminRepository.save(admin);
            userType = "ADMIN";
        } else {
            throw new RuntimeException("Invalid role: " + role.getName());
        }

        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(role.getName())
                .build();

        String jwt = tokenProvider.generateToken(userDetails);

        return JwtAuthenticationResponse.builder()
                .accessToken(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .role(role.getName())
                .userType(userType)
                .build();
    }
    
    private String getUserType(User user) {
        if (user instanceof Client) {
            return "CLIENT";
        } else if (user instanceof Provider) {
            return "PROVIDER";
        } else if (user instanceof Admin) {
            return "ADMIN";
        } else {
            return "UNKNOWN";
        }
    }
}