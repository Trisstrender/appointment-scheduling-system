package VoidSystems.appointment_service.domain.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "providers")
@PrimaryKeyJoinColumn(name = "id")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Provider extends User {
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @OneToMany(mappedBy = "provider")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @lombok.Builder.Default
    private List<Service> services = new ArrayList<>();
    
    @OneToMany(mappedBy = "provider")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @lombok.Builder.Default
    private List<Availability> availabilities = new ArrayList<>();
}