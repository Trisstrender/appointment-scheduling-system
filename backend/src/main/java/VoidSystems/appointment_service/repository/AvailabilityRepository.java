package VoidSystems.appointment_service.repository;

import VoidSystems.appointment_service.model.Availability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    
    List<Availability> findByProviderId(Long providerId);
    
    List<Availability> findByProviderIdAndRecurring(Long providerId, boolean recurring);
    
    List<Availability> findByProviderIdAndDayOfWeek(Long providerId, int dayOfWeek);
    
    List<Availability> findByProviderIdAndSpecificDate(Long providerId, LocalDate specificDate);
    
    List<Availability> findByRecurring(boolean recurring);
}