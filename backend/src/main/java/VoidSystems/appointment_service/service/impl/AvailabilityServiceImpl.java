package VoidSystems.appointment_service.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import VoidSystems.appointment_service.domain.model.Availability;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.AppointmentRepository;
import VoidSystems.appointment_service.domain.repository.AvailabilityRepository;
import VoidSystems.appointment_service.domain.repository.ProviderRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import VoidSystems.appointment_service.dto.availability.AvailabilityDTO;
import VoidSystems.appointment_service.exception.BadRequestException;
import VoidSystems.appointment_service.exception.ForbiddenException;
import VoidSystems.appointment_service.exception.ResourceNotFoundException;
import VoidSystems.appointment_service.mapper.AvailabilityMapper;
import VoidSystems.appointment_service.service.AvailabilityService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AvailabilityServiceImpl implements AvailabilityService {

    private final AvailabilityRepository availabilityRepository;
    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final AvailabilityMapper availabilityMapper;

    @Override
    public List<AvailabilityDTO> getAllAvailabilities() {
        return availabilityRepository.findAll().stream()
                .map(availabilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailabilityDTO> getAvailabilitiesByProviderId(Long providerId) {
        return availabilityRepository.findByProviderId(providerId).stream()
                .map(availabilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailabilityDTO> getRecurringAvailabilitiesByProviderId(Long providerId) {
        return availabilityRepository.findByProviderIdAndRecurring(providerId, true).stream()
                .map(availabilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailabilityDTO> getNonRecurringAvailabilitiesByProviderId(Long providerId) {
        return availabilityRepository.findByProviderIdAndRecurring(providerId, false).stream()
                .map(availabilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailabilityDTO> getAvailabilitiesByProviderIdAndDayOfWeek(Long providerId, DayOfWeek dayOfWeek) {
        return availabilityRepository.findByProviderIdAndDayOfWeek(providerId, dayOfWeek).stream()
                .map(availabilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailabilityDTO> getAvailabilitiesByProviderIdAndDate(Long providerId, LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return availabilityRepository.findByProviderIdAndDateOrDayOfWeek(providerId, date, dayOfWeek).stream()
                .map(availabilityMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AvailabilityDTO getAvailabilityById(Long id) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability", "id", id));
        
        return availabilityMapper.toDTO(availability);
    }

    @Override
    @Transactional
    public AvailabilityDTO createAvailability(AvailabilityDTO availabilityDTO, Long providerId) {
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
            throw new ForbiddenException("You are not authorized to create availability for this provider");
        }
        
        // Validate availability data
        validateAvailabilityData(availabilityDTO);
        
        Availability availability = availabilityMapper.toEntity(availabilityDTO, provider);
        Availability savedAvailability = availabilityRepository.save(availability);
        
        return availabilityMapper.toDTO(savedAvailability);
    }

    @Override
    @Transactional
    public AvailabilityDTO updateAvailability(Long id, AvailabilityDTO availabilityDTO) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability", "id", id));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(availability.getProvider().getId());
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to update this availability");
        }
        
        // Validate availability data
        validateAvailabilityData(availabilityDTO);
        
        availabilityMapper.updateEntityFromDTO(availability, availabilityDTO);
        Availability updatedAvailability = availabilityRepository.save(availability);
        
        return availabilityMapper.toDTO(updatedAvailability);
    }

    @Override
    @Transactional
    public void deleteAvailability(Long id) {
        Availability availability = availabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability", "id", id));
        
        // Check if the current user is the provider or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isProvider = currentUser.getId().equals(availability.getProvider().getId());
        
        if (!isAdmin && !isProvider) {
            throw new ForbiddenException("You are not authorized to delete this availability");
        }
        
        availabilityRepository.delete(availability);
    }

    @Override
    public boolean isTimeSlotAvailable(Long providerId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        // Check if the provider has availability for this time slot
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        List<Availability> availabilities = availabilityRepository.findByProviderIdAndDateOrDayOfWeek(providerId, date, dayOfWeek);
        
        if (availabilities.isEmpty()) {
            return false;
        }
        
        // Check if the time slot is within any of the provider's availability
        boolean withinAvailability = availabilities.stream().anyMatch(availability -> {
            return !startTime.isBefore(availability.getStartTime()) && 
                   !endTime.isAfter(availability.getEndTime());
        });
        
        if (!withinAvailability) {
            return false;
        }
        
        // Check if there are any overlapping appointments
        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = LocalDateTime.of(date, endTime);
        
        return !appointmentRepository.existsOverlappingAppointment(providerId, startDateTime, endDateTime);
    }
    
    private void validateAvailabilityData(AvailabilityDTO availabilityDTO) {
        if (availabilityDTO.getStartTime() == null || availabilityDTO.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        
        if (availabilityDTO.getStartTime().isAfter(availabilityDTO.getEndTime()) || 
            availabilityDTO.getStartTime().equals(availabilityDTO.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }
        
        if (availabilityDTO.getRecurring() == null) {
            throw new BadRequestException("Recurring flag is required");
        }
        
        if (availabilityDTO.getRecurring() && availabilityDTO.getDayOfWeek() == null) {
            throw new BadRequestException("Day of week is required for recurring availability");
        }
        
        if (!availabilityDTO.getRecurring() && availabilityDTO.getSpecificDate() == null) {
            throw new BadRequestException("Specific date is required for non-recurring availability");
        }
    }
}