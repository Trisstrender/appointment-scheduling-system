package VoidSystems.appointment_service.domain.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import VoidSystems.appointment_service.domain.model.Appointment;
import VoidSystems.appointment_service.domain.model.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    
    List<Appointment> findByClientId(Long clientId);
    
    List<Appointment> findByProviderId(Long providerId);
    
    List<Appointment> findByServiceId(Long serviceId);
    
    List<Appointment> findByStatus(AppointmentStatus status);
    
    @Query("SELECT a FROM Appointment a WHERE a.client.id = :clientId AND a.startTime >= :startDateTime ORDER BY a.startTime ASC")
    List<Appointment> findUpcomingAppointmentsByClientId(Long clientId, LocalDateTime startDateTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.provider.id = :providerId AND a.startTime >= :startDateTime ORDER BY a.startTime ASC")
    List<Appointment> findUpcomingAppointmentsByProviderId(Long providerId, LocalDateTime startDateTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.provider.id = :providerId AND a.startTime BETWEEN :startDateTime AND :endDateTime")
    List<Appointment> findAppointmentsByProviderIdAndTimeRange(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    @Query("SELECT a FROM Appointment a WHERE a.client.id = :clientId AND a.startTime BETWEEN :startDateTime AND :endDateTime")
    List<Appointment> findAppointmentsByClientIdAndTimeRange(Long clientId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.provider.id = :providerId AND " +
           "((a.startTime <= :endDateTime AND a.endTime >= :startDateTime) OR " +
           "(a.startTime >= :startDateTime AND a.startTime < :endDateTime) OR " +
           "(a.endTime > :startDateTime AND a.endTime <= :endDateTime))")
    boolean existsOverlappingAppointment(Long providerId, LocalDateTime startDateTime, LocalDateTime endDateTime);
}