package VoidSystems.appointment_service.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import VoidSystems.appointment_service.dto.availability.AvailabilityDTO;

public interface AvailabilityService {
    
    List<AvailabilityDTO> getAllAvailabilities();
    
    List<AvailabilityDTO> getAvailabilitiesByProviderId(Long providerId);
    
    List<AvailabilityDTO> getRecurringAvailabilitiesByProviderId(Long providerId);
    
    List<AvailabilityDTO> getNonRecurringAvailabilitiesByProviderId(Long providerId);
    
    List<AvailabilityDTO> getAvailabilitiesByProviderIdAndDayOfWeek(Long providerId, DayOfWeek dayOfWeek);
    
    List<AvailabilityDTO> getAvailabilitiesByProviderIdAndDate(Long providerId, LocalDate date);
    
    AvailabilityDTO getAvailabilityById(Long id);
    
    AvailabilityDTO createAvailability(AvailabilityDTO availabilityDTO, Long providerId);
    
    AvailabilityDTO updateAvailability(Long id, AvailabilityDTO availabilityDTO);
    
    void deleteAvailability(Long id);
    
    boolean isTimeSlotAvailable(Long providerId, LocalDate date, java.time.LocalTime startTime, java.time.LocalTime endTime);
}