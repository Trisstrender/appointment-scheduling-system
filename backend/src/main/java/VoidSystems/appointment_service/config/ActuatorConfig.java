package VoidSystems.appointment_service.config;

import org.springframework.boot.actuate.autoconfigure.endpoint.web.CorsEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.boot.actuate.autoconfigure.web.server.ManagementPortType;
import org.springframework.boot.actuate.endpoint.ExposableEndpoint;
import org.springframework.boot.actuate.endpoint.web.EndpointLinksResolver;
import org.springframework.boot.actuate.endpoint.web.EndpointMapping;
import org.springframework.boot.actuate.endpoint.web.EndpointMediaTypes;
import org.springframework.boot.actuate.endpoint.web.ExposableWebEndpoint;
import org.springframework.boot.actuate.endpoint.web.WebEndpointsSupplier;
import org.springframework.boot.actuate.endpoint.web.servlet.WebMvcEndpointHandlerMapping;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Configuration class for Spring Boot Actuator endpoints.
 */
@Configuration
public class ActuatorConfig {

    /**
     * Custom WebMvcEndpointHandlerMapping bean to configure Actuator endpoints.
     * This is needed to make Actuator endpoints work with Spring Security.
     */
    @Bean
    public WebMvcEndpointHandlerMapping webEndpointServletHandlerMapping(
            WebEndpointsSupplier webEndpointsSupplier,
            EndpointMediaTypes endpointMediaTypes,
            CorsEndpointProperties corsProperties,
            WebEndpointProperties webEndpointProperties,
            Environment environment) {
        
        List<ExposableEndpoint<?>> allEndpoints = new ArrayList<>();
        Collection<ExposableWebEndpoint> webEndpoints = webEndpointsSupplier.getEndpoints();
        allEndpoints.addAll(webEndpoints);
        
        String basePath = webEndpointProperties.getBasePath();
        EndpointMapping endpointMapping = new EndpointMapping(basePath);
        
        boolean shouldRegisterLinksMapping = this.shouldRegisterLinksMapping(
                webEndpointProperties, environment, basePath);
        
        return new WebMvcEndpointHandlerMapping(
                endpointMapping, 
                webEndpoints, 
                endpointMediaTypes,
                corsProperties.toCorsConfiguration(), 
                new EndpointLinksResolver(allEndpoints, basePath),
                shouldRegisterLinksMapping);
    }

    /**
     * Determine if the links endpoint should be registered.
     */
    private boolean shouldRegisterLinksMapping(WebEndpointProperties webEndpointProperties,
                                              Environment environment, String basePath) {
        return webEndpointProperties.getDiscovery().isEnabled() && 
               (StringUtils.hasText(basePath) || 
               ManagementPortType.get(environment).equals(ManagementPortType.SAME));
    }
} 