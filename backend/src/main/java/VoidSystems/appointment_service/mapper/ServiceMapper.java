package VoidSystems.appointment_service.mapper;

import org.springframework.stereotype.Component;

import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.Service;
import VoidSystems.appointment_service.dto.service.ServiceDTO;

@Component
public class ServiceMapper {
    
    public ServiceDTO toDTO(Service service) {
        if (service == null) {
            return null;
        }
        
        Provider provider = service.getProvider();
        String providerName = provider != null ? provider.getFirstName() + " " + provider.getLastName() : null;
        
        return ServiceDTO.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .durationMinutes(service.getDurationMinutes())
                .price(service.getPrice())
                .providerId(provider != null ? provider.getId() : null)
                .providerName(providerName)
                .active(service.getActive())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
    }
    
    public Service toEntity(ServiceDTO serviceDTO, Provider provider) {
        if (serviceDTO == null) {
            return null;
        }
        
        return Service.builder()
                .name(serviceDTO.getName())
                .description(serviceDTO.getDescription())
                .durationMinutes(serviceDTO.getDurationMinutes())
                .price(serviceDTO.getPrice())
                .provider(provider)
                .active(serviceDTO.getActive() != null ? serviceDTO.getActive() : true)
                .build();
    }
    
    public void updateEntityFromDTO(Service service, ServiceDTO serviceDTO) {
        if (service == null || serviceDTO == null) {
            return;
        }
        
        if (serviceDTO.getName() != null) {
            service.setName(serviceDTO.getName());
        }
        
        if (serviceDTO.getDescription() != null) {
            service.setDescription(serviceDTO.getDescription());
        }
        
        if (serviceDTO.getDurationMinutes() != null) {
            service.setDurationMinutes(serviceDTO.getDurationMinutes());
        }
        
        if (serviceDTO.getPrice() != null) {
            service.setPrice(serviceDTO.getPrice());
        }
        
        if (serviceDTO.getActive() != null) {
            service.setActive(serviceDTO.getActive());
        }
    }
}