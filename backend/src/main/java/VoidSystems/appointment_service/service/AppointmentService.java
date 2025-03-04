package VoidSystems.appointment_service.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import VoidSystems.appointment_service.dto.appointment.AppointmentDTO;

public interface AppointmentService {
    
    List<AppointmentDTO> getAllAppointments();
    
    List<AppointmentDTO> getAppointmentsByClientId(Long clientId);
    
    List<AppointmentDTO> getAppointmentsByProviderId(Long providerId);
    
    List<AppointmentDTO> getAppointmentsByServiceId(Long serviceId);
    
    List<AppointmentDTO> getAppointmentsByStatus(String status);
    
    List<AppointmentDTO> getUpcomingAppointmentsByClientId(Long clientId);
    
    List<AppointmentDTO> getUpcomingAppointmentsByProviderId(Long providerId);
    
    List<AppointmentDTO> getAppointmentsByProviderIdAndDateRange(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    List<AppointmentDTO> getAppointmentsByClientIdAndDateRange(Long clientId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    List<AppointmentDTO> getAppointmentsByProviderIdAndDate(Long providerId, LocalDate date);
    
    List<AppointmentDTO> getAppointmentsByClientIdAndDate(Long clientId, LocalDate date);
    
    AppointmentDTO getAppointmentById(Long id);
    
    AppointmentDTO createAppointment(AppointmentDTO appointmentDTO);
    
    AppointmentDTO updateAppointment(Long id, AppointmentDTO appointmentDTO);
    
    AppointmentDTO updateAppointmentStatus(Long id, String status);
    
    void deleteAppointment(Long id);
    
    boolean isTimeSlotAvailable(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime);
}