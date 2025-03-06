package VoidSystems.appointment_service.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@Profile("test-only")
@EnableAutoConfiguration
@EntityScan(basePackages = "VoidSystems.appointment_service.domain.model")
@EnableJpaRepositories(
    basePackages = "VoidSystems.appointment_service.domain.repository",
    excludeFilters = @org.springframework.context.annotation.ComponentScan.Filter(
        type = FilterType.REGEX,
        pattern = "VoidSystems\\.appointment_service\\.repository\\..*"
    )
)
public class IntegrationTestConfig {
    // This configuration class is specifically for integration tests
    // It ensures that only domain model entities and repositories are used
} 