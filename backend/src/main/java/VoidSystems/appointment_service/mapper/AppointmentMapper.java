package VoidSystems.appointment_service.mapper;

import org.springframework.stereotype.Component;

import VoidSystems.appointment_service.domain.model.Appointment;
import VoidSystems.appointment_service.domain.model.AppointmentStatus;
import VoidSystems.appointment_service.domain.model.Client;
import VoidSystems.appointment_service.domain.model.Provider;
import VoidSystems.appointment_service.domain.model.Service;
import VoidSystems.appointment_service.dto.appointment.AppointmentDTO;

@Component
public class AppointmentMapper {
    
    public AppointmentDTO toDTO(Appointment appointment) {
        if (appointment == null) {
            return null;
        }
        
        Client client = appointment.getClient();
        Provider provider = appointment.getProvider();
        Service service = appointment.getService();
        AppointmentStatus status = appointment.getStatus();
        
        String clientName = client != null ? client.getFirstName() + " " + client.getLastName() : null;
        String providerName = provider != null ? provider.getFirstName() + " " + provider.getLastName() : null;
        String serviceName = service != null ? service.getName() : null;
        String statusName = status != null ? status.getName() : null;
        
        return AppointmentDTO.builder()
                .id(appointment.getId())
                .clientId(client != null ? client.getId() : null)
                .clientName(clientName)
                .providerId(provider != null ? provider.getId() : null)
                .providerName(providerName)
                .serviceId(service != null ? service.getId() : null)
                .serviceName(serviceName)
                .startTime(appointment.getStartTime())
                .endTime(appointment.getEndTime())
                .status(statusName)
                .notes(appointment.getNotes())
                .createdAt(appointment.getCreatedAt())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }
    
    public Appointment toEntity(AppointmentDTO appointmentDTO, Client client, Provider provider, Service service, AppointmentStatus status) {
        if (appointmentDTO == null) {
            return null;
        }
        
        return Appointment.builder()
                .client(client)
                .provider(provider)
                .service(service)
                .startTime(appointmentDTO.getStartTime())
                .endTime(appointmentDTO.getEndTime())
                .status(status)
                .notes(appointmentDTO.getNotes())
                .build();
    }
    
    public void updateEntityFromDTO(Appointment appointment, AppointmentDTO appointmentDTO, Service service, AppointmentStatus status) {
        if (appointment == null || appointmentDTO == null) {
            return;
        }
        
        if (appointmentDTO.getStartTime() != null) {
            appointment.setStartTime(appointmentDTO.getStartTime());
        }
        
        if (appointmentDTO.getEndTime() != null) {
            appointment.setEndTime(appointmentDTO.getEndTime());
        }
        
        if (service != null) {
            appointment.setService(service);
        }
        
        if (status != null) {
            appointment.setStatus(status);
        }
        
        if (appointmentDTO.getNotes() != null) {
            appointment.setNotes(appointmentDTO.getNotes());
        }
    }
}