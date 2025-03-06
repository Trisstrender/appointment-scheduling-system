package VoidSystems.appointment_service.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import VoidSystems.appointment_service.domain.model.Appointment;
import VoidSystems.appointment_service.domain.model.AppointmentStatus;
import VoidSystems.appointment_service.domain.model.Client;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.User;
import VoidSystems.appointment_service.domain.repository.AppointmentRepository;
import VoidSystems.appointment_service.domain.repository.AppointmentStatusRepository;
import VoidSystems.appointment_service.domain.repository.ClientRepository;
import VoidSystems.appointment_service.domain.repository.ProviderRepository;
import VoidSystems.appointment_service.domain.repository.ServiceRepository;
import VoidSystems.appointment_service.domain.repository.UserRepository;
import VoidSystems.appointment_service.dto.appointment.AppointmentDTO;
import VoidSystems.appointment_service.exception.BadRequestException;
import VoidSystems.appointment_service.exception.ForbiddenException;
import VoidSystems.appointment_service.exception.ResourceNotFoundException;
import VoidSystems.appointment_service.mapper.AppointmentMapper;
import VoidSystems.appointment_service.service.AppointmentService;
import VoidSystems.appointment_service.service.AvailabilityService;
import VoidSystems.appointment_service.service.NotificationService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;
    private final ServiceRepository serviceRepository;
    private final AppointmentStatusRepository appointmentStatusRepository;
    private final UserRepository userRepository;
    private final AppointmentMapper appointmentMapper;
    private final AvailabilityService availabilityService;
    private final NotificationService notificationService;
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    @Override
    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByClientId(Long clientId) {
        return appointmentRepository.findByClientId(clientId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByProviderId(Long providerId) {
        return appointmentRepository.findByProviderId(providerId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByServiceId(Long serviceId) {
        return appointmentRepository.findByServiceId(serviceId).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByStatus(String status) {
        AppointmentStatus appointmentStatus = appointmentStatusRepository.findByName(status)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentStatus", "name", status));
        
        return appointmentRepository.findByStatus(appointmentStatus).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getUpcomingAppointmentsByClientId(Long clientId) {
        return appointmentRepository.findUpcomingAppointmentsByClientId(clientId, LocalDateTime.now()).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getUpcomingAppointmentsByProviderId(Long providerId) {
        return appointmentRepository.findUpcomingAppointmentsByProviderId(providerId, LocalDateTime.now()).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByProviderIdAndDateRange(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return appointmentRepository.findAppointmentsByProviderIdAndTimeRange(providerId, startDateTime, endDateTime).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByClientIdAndDateRange(Long clientId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        return appointmentRepository.findAppointmentsByClientIdAndTimeRange(clientId, startDateTime, endDateTime).stream()
                .map(appointmentMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByProviderIdAndDate(Long providerId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        return getAppointmentsByProviderIdAndDateRange(providerId, startOfDay, endOfDay);
    }

    @Override
    public List<AppointmentDTO> getAppointmentsByClientIdAndDate(Long clientId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        
        return getAppointmentsByClientIdAndDateRange(clientId, startOfDay, endOfDay);
    }

    @Override
    public AppointmentDTO getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        return appointmentMapper.toDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentDTO createAppointment(AppointmentDTO appointmentDTO) {
        // Validate required fields
        if (appointmentDTO.getClientId() == null) {
            throw new BadRequestException("Client ID is required");
        }
        
        if (appointmentDTO.getProviderId() == null) {
            throw new BadRequestException("Provider ID is required");
        }
        
        if (appointmentDTO.getServiceId() == null) {
            throw new BadRequestException("Service ID is required");
        }
        
        if (appointmentDTO.getStartTime() == null) {
            throw new BadRequestException("Start time is required");
        }
        
        // Get entities
        Client client = clientRepository.findById(appointmentDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client", "id", appointmentDTO.getClientId()));
        
        Provider provider = providerRepository.findById(appointmentDTO.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider", "id", appointmentDTO.getProviderId()));
        
        VoidSystems.appointment_service.domain.model.Service service = serviceRepository.findById(appointmentDTO.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", appointmentDTO.getServiceId()));
        
        // Check if the service belongs to the provider
        if (!service.getProvider().getId().equals(provider.getId())) {
            throw new BadRequestException("The service does not belong to the provider");
        }
        
        // Check if the current user is the client or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isClient = currentUser.getId().equals(client.getId());
        
        if (!isAdmin && !isClient) {
            throw new ForbiddenException("You are not authorized to create an appointment for this client");
        }
        
        // Calculate end time based on service duration
        LocalDateTime startTime = appointmentDTO.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(service.getDurationMinutes());
        
        // Check if the time slot is available
        if (!isTimeSlotAvailable(provider.getId(), startTime, endTime)) {
            throw new BadRequestException("The selected time slot is not available");
        }
        
        // Get pending status
        AppointmentStatus pendingStatus = appointmentStatusRepository.findByName(AppointmentStatus.PENDING)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentStatus", "name", AppointmentStatus.PENDING));
        
        // Create appointment
        Appointment appointment = appointmentMapper.toEntity(appointmentDTO, client, provider, service, pendingStatus);
        appointment.setEndTime(endTime);
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Create notifications
        String formattedDateTime = startTime.format(DATE_TIME_FORMATTER);
        
        // Notify the provider about the new appointment
        notificationService.createNewAppointmentNotification(
            provider, 
            savedAppointment.getId(), 
            client.getFirstName() + " " + client.getLastName(),
            service.getName(),
            formattedDateTime
        );
        
        return appointmentMapper.toDTO(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        // Check if the current user is the client, provider, or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isClient = currentUser.getId().equals(appointment.getClient().getId());
        boolean isProvider = currentUser.getId().equals(appointment.getProvider().getId());
        
        if (!isAdmin && !isClient && !isProvider) {
            throw new ForbiddenException("You are not authorized to update this appointment");
        }
        
        // Update service if provided
        VoidSystems.appointment_service.domain.model.Service service = null;
        if (appointmentDTO.getServiceId() != null) {
            service = serviceRepository.findById(appointmentDTO.getServiceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service", "id", appointmentDTO.getServiceId()));
            
            // Check if the service belongs to the provider
            if (!service.getProvider().getId().equals(appointment.getProvider().getId())) {
                throw new BadRequestException("The service does not belong to the provider");
            }
        }
        
        // Update status if provided
        AppointmentStatus status = null;
        if (appointmentDTO.getStatus() != null) {
            status = appointmentStatusRepository.findByName(appointmentDTO.getStatus())
                    .orElseThrow(() -> new ResourceNotFoundException("AppointmentStatus", "name", appointmentDTO.getStatus()));
        }
        
        // Calculate new end time if start time or service is changed
        if (appointmentDTO.getStartTime() != null || service != null) {
            LocalDateTime startTime = appointmentDTO.getStartTime() != null ? appointmentDTO.getStartTime() : appointment.getStartTime();
            int durationMinutes = service != null ? service.getDurationMinutes() : appointment.getService().getDurationMinutes();
            
            LocalDateTime endTime = startTime.plusMinutes(durationMinutes);
            appointmentDTO.setEndTime(endTime);
            
            // Check if the new time slot is available (excluding the current appointment)
            if (!isTimeSlotAvailableExcludingAppointment(appointment.getProvider().getId(), startTime, endTime, id)) {
                throw new BadRequestException("The selected time slot is not available");
            }
        }
        
        // Update appointment
        appointmentMapper.updateEntityFromDTO(appointment, appointmentDTO, service, status);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return appointmentMapper.toDTO(updatedAppointment);
    }

    @Override
    @Transactional
    public AppointmentDTO updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        // Check if the current user is the client, provider, or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isClient = currentUser.getId().equals(appointment.getClient().getId());
        boolean isProvider = currentUser.getId().equals(appointment.getProvider().getId());
        
        if (!isAdmin && !isClient && !isProvider) {
            throw new ForbiddenException("You are not authorized to update this appointment");
        }
        
        // Validate status transitions
        String currentStatus = appointment.getStatus().getName();
        validateStatusTransition(currentStatus, status, isClient, isProvider, isAdmin);
        
        // Update status
        AppointmentStatus newStatus = appointmentStatusRepository.findByName(status)
                .orElseThrow(() -> new ResourceNotFoundException("AppointmentStatus", "name", status));
        
        appointment.setStatus(newStatus);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        // Create notifications based on status change
        String formattedDateTime = appointment.getStartTime().format(DATE_TIME_FORMATTER);
        String serviceName = appointment.getService().getName();
        
        if ("CONFIRMED".equals(status) && !"CONFIRMED".equals(currentStatus)) {
            // Notify the client that their appointment has been confirmed
            notificationService.createAppointmentConfirmationNotification(
                appointment.getClient(),
                appointment.getId(),
                serviceName,
                formattedDateTime
            );
        } else if ("CANCELLED".equals(status) && !"CANCELLED".equals(currentStatus)) {
            // Notify both client and provider about cancellation
            notificationService.createAppointmentCancellationNotification(
                appointment.getClient(),
                appointment.getId(),
                serviceName,
                formattedDateTime
            );
            
            notificationService.createAppointmentCancellationNotification(
                appointment.getProvider(),
                appointment.getId(),
                serviceName,
                formattedDateTime
            );
        }
        
        return appointmentMapper.toDTO(updatedAppointment);
    }

    @Override
    @Transactional
    public void deleteAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        // Check if the current user is the client, provider, or an admin
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));
        
        boolean isAdmin = currentUser.getRole().getName().equals("ROLE_ADMIN");
        boolean isClient = currentUser.getId().equals(appointment.getClient().getId());
        boolean isProvider = currentUser.getId().equals(appointment.getProvider().getId());
        
        if (!isAdmin && !isClient && !isProvider) {
            throw new ForbiddenException("You are not authorized to delete this appointment");
        }
        
        // Only allow deletion of pending or cancelled appointments
        String status = appointment.getStatus().getName();
        if (!status.equals(AppointmentStatus.PENDING) && !status.equals(AppointmentStatus.CANCELLED)) {
            throw new BadRequestException("Only pending or cancelled appointments can be deleted");
        }
        
        appointmentRepository.delete(appointment);
    }

    @Override
    public boolean isTimeSlotAvailable(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime) {
        // Check if the provider has availability for this time slot
        LocalDate date = startDateTime.toLocalDate();
        LocalTime startTime = startDateTime.toLocalTime();
        LocalTime endTime = endDateTime.toLocalTime();
        
        boolean hasAvailability = availabilityService.isTimeSlotAvailable(providerId, date, startTime, endTime);
        
        if (!hasAvailability) {
            return false;
        }
        
        // Check if there are any overlapping appointments
        return !appointmentRepository.existsOverlappingAppointment(providerId, startDateTime, endDateTime);
    }
    
    private boolean isTimeSlotAvailableExcludingAppointment(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime, Long appointmentId) {
        // Check if the provider has availability for this time slot
        LocalDate date = startDateTime.toLocalDate();
        LocalTime startTime = startDateTime.toLocalTime();
        LocalTime endTime = endDateTime.toLocalTime();
        
        boolean hasAvailability = availabilityService.isTimeSlotAvailable(providerId, date, startTime, endTime);
        
        if (!hasAvailability) {
            return false;
        }
        
        // Check if there are any overlapping appointments (excluding the current appointment)
        List<Appointment> overlappingAppointments = appointmentRepository.findAppointmentsByProviderIdAndTimeRange(providerId, startDateTime, endDateTime);
        
        return overlappingAppointments.stream()
                .noneMatch(appointment -> !appointment.getId().equals(appointmentId));
    }
    
    private void validateStatusTransition(String currentStatus, String newStatus, boolean isClient, boolean isProvider, boolean isAdmin) {
        // Clients can only cancel their pending or confirmed appointments
        if (isClient && !isProvider && !isAdmin) {
            if (newStatus.equals(AppointmentStatus.CANCELLED)) {
                if (!currentStatus.equals(AppointmentStatus.PENDING) && !currentStatus.equals(AppointmentStatus.CONFIRMED)) {
                    throw new BadRequestException("Clients can only cancel pending or confirmed appointments");
                }
            } else {
                throw new BadRequestException("Clients can only cancel appointments");
            }
        }
        
        // Providers can confirm, cancel, complete, or mark as no-show
        if (isProvider && !isClient && !isAdmin) {
            switch (newStatus) {
                case AppointmentStatus.CONFIRMED:
                    if (!currentStatus.equals(AppointmentStatus.PENDING)) {
                        throw new BadRequestException("Only pending appointments can be confirmed");
                    }
                    break;
                case AppointmentStatus.CANCELLED:
                    if (!currentStatus.equals(AppointmentStatus.PENDING) && !currentStatus.equals(AppointmentStatus.CONFIRMED)) {
                        throw new BadRequestException("Only pending or confirmed appointments can be cancelled");
                    }
                    break;
                case AppointmentStatus.COMPLETED:
                    if (!currentStatus.equals(AppointmentStatus.CONFIRMED)) {
                        throw new BadRequestException("Only confirmed appointments can be marked as completed");
                    }
                    break;
                case AppointmentStatus.NO_SHOW:
                    if (!currentStatus.equals(AppointmentStatus.CONFIRMED)) {
                        throw new BadRequestException("Only confirmed appointments can be marked as no-show");
                    }
                    break;
                default:
                    throw new BadRequestException("Invalid status transition");
            }
        }
        
        // Admins can change to any status
        if (!isAdmin && !isClient && !isProvider) {
            throw new BadRequestException("You are not authorized to change the status of this appointment");
        }
    }
}