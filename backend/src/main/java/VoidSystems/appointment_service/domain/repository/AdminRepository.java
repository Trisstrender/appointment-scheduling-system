package VoidSystems.appointment_service.domain.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import VoidSystems.appointment_service.domain.model.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    
    Optional<Admin> findByEmail(String email);
    
    Optional<Admin> findBySuperAdmin(Boolean superAdmin);
}