package VoidSystems.appointment_service.service;

import java.util.List;

import VoidSystems.appointment_service.dto.service.ServiceDTO;

public interface ServiceService {
    
    List<ServiceDTO> getAllServices();
    
    List<ServiceDTO> getAllActiveServices();
    
    List<ServiceDTO> getServicesByProviderId(Long providerId);
    
    List<ServiceDTO> getActiveServicesByProviderId(Long providerId);
    
    ServiceDTO getServiceById(Long id);
    
    ServiceDTO getServiceByIdAndProviderId(Long id, Long providerId);
    
    ServiceDTO createService(ServiceDTO serviceDTO, Long providerId);
    
    ServiceDTO updateService(Long id, ServiceDTO serviceDTO);
    
    void deleteService(Long id);
    
    void activateService(Long id);
    
    void deactivateService(Long id);
}