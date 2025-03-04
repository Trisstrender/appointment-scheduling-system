package VoidSystems.appointment_service.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.ProviderRepository;
import VoidSystems.appointment_service.domain.repository.ServiceRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import VoidSystems.appointment_service.dto.service.ServiceDTO;
import VoidSystems.appointment_service.exception.BadRequestException;
import VoidSystems.appointment_service.exception.ForbiddenException;
import VoidSystems.appointment_service.exception.ResourceNotFoundException;
import VoidSystems.appointment_service.mapper.ServiceMapper;
import VoidSystems.appointment_service.service.ServiceService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final ServiceMapper serviceMapper;

    @Override
    public List<ServiceDTO> getAllServices() {
        return serviceRepository.findAll().stream()
                .map(serviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceDTO> getAllActiveServices() {
        return serviceRepository.findAllActive().stream()
                .map(serviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceDTO> getServicesByProviderId(Long providerId) {
        return serviceRepository.findByProviderId(providerId).stream()
                .map(serviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceDTO> getActiveServicesByProviderId(Long providerId) {
        return serviceRepository.findByProviderIdAndActive(providerId, true).stream()
                .map(serviceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceDTO getServiceById(Long id) {
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        return serviceMapper.toDTO(service);
    }

    @Override
    public ServiceDTO getServiceByIdAndProviderId(Long id, Long providerId) {
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findByIdAndProviderId(id, providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        return serviceMapper.toDTO(service);
    }

    @Override
    @Transactional
    public ServiceDTO createService(ServiceDTO serviceDTO, Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", "id", providerId));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(providerId);
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to create services for this provider");
        }
        
        VoidSystems.appointment_service.domain.model.Service service = serviceMapper.toEntity(serviceDTO, provider);
        VoidSystems.appointment_service.domain.model.Service savedService = serviceRepository.save(service);
        
        return serviceMapper.toDTO(savedService);
    }

    @Override
    @Transactional
    public ServiceDTO updateService(Long id, ServiceDTO serviceDTO) {
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(service.getProvider().getId());
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to update this service");
        }
        
        serviceMapper.updateEntityFromDTO(service, serviceDTO);
        VoidSystems.appointment_service.domain.model.Service updatedService = serviceRepository.save(service);
        
        return serviceMapper.toDTO(updatedService);
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(service.getProvider().getId());
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to delete this service");
        }
        
        // Check if the service has any appointments
        if (!service.getAppointments().isEmpty()) {
            throw new BadRequestException("Cannot delete service with existing appointments");
        }
        
        serviceRepository.delete(service);
    }

    @Override
    @Transactional
    public void activateService(Long id) {
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(service.getProvider().getId());
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to activate this service");
        }
        
        service.setActive(true);
        serviceRepository.save(service);
    }

    @Override
    @Transactional
    public void deactivateService(Long id) {
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(service.getProvider().getId());
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to deactivate this service");
        }
        
        service.setActive(false);
        serviceRepository.save(service);
    }
}