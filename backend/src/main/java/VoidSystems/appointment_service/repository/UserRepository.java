package VoidSystems.appointment_service.repository;

import VoidSystems.appointment_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByUserType(String userType);
    
    List<User> findByUserTypeAndActive(String userType, boolean active);
}