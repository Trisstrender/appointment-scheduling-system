package VoidSystems.appointment_service.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@Primary
@Profile({"default", "dev", "prod"}) // Exclude test profile
@EnableJpaRepositories(
    basePackages = "VoidSystems.appointment_service.domain.repository",
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = org.springframework.context.annotation.FilterType.REGEX,
        pattern = "VoidSystems\\.appointment_service\\.repository\\..*"
    )
)
@EntityScan(basePackages = {"VoidSystems.appointment_service.domain.model"})
public class RepositoryConfig {
    // This configuration class explicitly defines the domain repository package to scan
    // and excludes the legacy repositories to avoid conflicts
} 