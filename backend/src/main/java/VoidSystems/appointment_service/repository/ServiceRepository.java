package VoidSystems.appointment_service.repository;

import VoidSystems.appointment_service.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    
    List<Service> findByProviderId(Long providerId);
    
    List<Service> findByProviderIdAndActive(Long providerId, boolean active);
    
    List<Service> findByActive(boolean active);
}