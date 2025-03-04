package VoidSystems.appointment_service.repository;

import VoidSystems.appointment_service.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByClientId(Long clientId);
    
    List<Appointment> findByClientIdAndStatus(Long clientId, String status);
    
    List<Appointment> findByProviderId(Long providerId);
    
    List<Appointment> findByProviderIdAndStatus(Long providerId, String status);
    
    List<Appointment> findByServiceId(Long serviceId);
    
    List<Appointment> findByStatus(String status);
    
    List<Appointment> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    
    List<Appointment> findByProviderIdAndStartTimeBetween(Long providerId, LocalDateTime start, LocalDateTime end);
    
    List<Appointment> findByClientIdAndStartTimeBetween(Long clientId, LocalDateTime start, LocalDateTime end);
}