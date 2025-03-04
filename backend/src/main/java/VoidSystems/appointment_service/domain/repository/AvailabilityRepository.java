package VoidSystems.appointment_service.domain.repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import VoidSystems.appointment_service.domain.model.Availability;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {
    
    List<Availability> findByProviderId(Long providerId);
    
    List<Availability> findByProviderIdAndRecurring(Long providerId, Boolean recurring);
    
    List<Availability> findByProviderIdAndDayOfWeek(Long providerId, DayOfWeek dayOfWeek);
    
    @Query("SELECT a FROM Availability a WHERE a.provider.id = :providerId AND a.recurring = false AND a.specificDate = :date")
    List<Availability> findByProviderIdAndSpecificDate(Long providerId, LocalDate date);
    
    @Query("SELECT a FROM Availability a WHERE a.provider.id = :providerId AND " +
           "((a.recurring = true AND a.dayOfWeek = :dayOfWeek) OR " +
           "(a.recurring = false AND a.specificDate = :date))")
    List<Availability> findByProviderIdAndDateOrDayOfWeek(Long providerId, LocalDate date, DayOfWeek dayOfWeek);
}