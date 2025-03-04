package VoidSystems.appointment_service.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import VoidSystems.appointment_service.domain.model.Provider;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    
    Optional<Provider> findByEmail(String email);
    
    @Query("SELECT p FROM Provider p JOIN FETCH p.services WHERE p.id = :id")
    Optional<Provider> findByIdWithServices(Long id);
    
    @Query("SELECT DISTINCT p FROM Provider p JOIN FETCH p.services")
    List<Provider> findAllWithServices();
}