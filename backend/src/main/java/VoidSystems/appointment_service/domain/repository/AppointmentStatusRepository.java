package VoidSystems.appointment_service.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import VoidSystems.appointment_service.domain.model.AppointmentStatus;

@Repository
public interface AppointmentStatusRepository extends JpaRepository<AppointmentStatus, Long> {
    
    Optional<AppointmentStatus> findByName(String name);
}