package VoidSystems.appointment_service.mapper;

import org.springframework.stereotype.Component;

import VoidSystems.appointment_service.domain.model.Availability;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.dto.availability.AvailabilityDTO;

@Component
public class AvailabilityMapper {
    
    public AvailabilityDTO toDTO(Availability availability) {
        if (availability == null) {
            return null;
        }
        
        Provider provider = availability.getProvider();
        String providerName = provider != null ? provider.getFirstName() + " " + provider.getLastName() : null;
        
        return AvailabilityDTO.builder()
                .id(availability.getId())
                .providerId(provider != null ? provider.getId() : null)
                .providerName(providerName)
                .dayOfWeek(availability.getDayOfWeek())
                .startTime(availability.getStartTime())
                .endTime(availability.getEndTime())
                .recurring(availability.getRecurring())
                .specificDate(availability.getSpecificDate())
                .createdAt(availability.getCreatedAt())
                .updatedAt(availability.getUpdatedAt())
                .build();
    }
    
    public Availability toEntity(AvailabilityDTO availabilityDTO, Provider provider) {
        if (availabilityDTO == null) {
            return null;
        }
        
        return Availability.builder()
                .provider(provider)
                .dayOfWeek(availabilityDTO.getDayOfWeek())
                .startTime(availabilityDTO.getStartTime())
                .endTime(availabilityDTO.getEndTime())
                .recurring(availabilityDTO.getRecurring())
                .specificDate(availabilityDTO.getSpecificDate())
                .build();
    }
    
    public void updateEntityFromDTO(Availability availability, AvailabilityDTO availabilityDTO) {
        if (availability == null || availabilityDTO == null) {
            return;
        }
        
        if (availabilityDTO.getDayOfWeek() != null) {
            availability.setDayOfWeek(availabilityDTO.getDayOfWeek());
        }
        
        if (availabilityDTO.getStartTime() != null) {
            availability.setStartTime(availabilityDTO.getStartTime());
        }
        
        if (availabilityDTO.getEndTime() != null) {
            availability.setEndTime(availabilityDTO.getEndTime());
        }
        
        if (availabilityDTO.getRecurring() != null) {
            availability.setRecurring(availabilityDTO.getRecurring());
        }
        
        if (availabilityDTO.getSpecificDate() != null) {
            availability.setSpecificDate(availabilityDTO.getSpecificDate());
        }
    }
}