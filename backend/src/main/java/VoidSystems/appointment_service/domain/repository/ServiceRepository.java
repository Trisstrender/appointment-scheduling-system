package VoidSystems.appointment_service.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import VoidSystems.appointment_service.domain.model.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByProviderId(Long providerId);
    
    List<Service> findByProviderIdAndActive(Long providerId, Boolean active);
    
    @Query("SELECT s FROM Service s WHERE s.active = true")
    List<Service> findAllActive();
    
    Optional<Service> findByIdAndProviderId(Long id, Long providerId);
}