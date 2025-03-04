package VoidSystems.appointment_service.controller;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import VoidSystems.appointment_service.dto.availability.AvailabilityDTO;
import VoidSystems.appointment_service.dto.common.ApiResponse;
import VoidSystems.appointment_service.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AvailabilityDTO>>> getAllAvailabilities() {
        List<AvailabilityDTO> availabilities = availabilityService.getAllAvailabilities();
        return ResponseEntity.ok(ApiResponse.success(availabilities));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<AvailabilityDTO>> getAvailabilityById(@PathVariable Long id) {
        AvailabilityDTO availability = availabilityService.getAvailabilityById(id);
        return ResponseEntity.ok(ApiResponse.success(availability));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<AvailabilityDTO>>> getAvailabilitiesByProviderId(
            @PathVariable Long providerId,
            @RequestParam(required = false) Boolean recurring) {
        List<AvailabilityDTO> availabilities;
        
        if (recurring != null) {
            if (recurring) {
                availabilities = availabilityService.getRecurringAvailabilitiesByProviderId(providerId);
            } else {
                availabilities = availabilityService.getNonRecurringAvailabilitiesByProviderId(providerId);
            }
        } else {
            availabilities = availabilityService.getAvailabilitiesByProviderId(providerId);
        }
        
        return ResponseEntity.ok(ApiResponse.success(availabilities));
    }

    @GetMapping("/provider/{providerId}/day/{dayOfWeek}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<AvailabilityDTO>>> getAvailabilitiesByProviderIdAndDayOfWeek(
            @PathVariable Long providerId,
            @PathVariable DayOfWeek dayOfWeek) {
        List<AvailabilityDTO> availabilities = availabilityService.getAvailabilitiesByProviderIdAndDayOfWeek(providerId, dayOfWeek);
        return ResponseEntity.ok(ApiResponse.success(availabilities));
    }

    @GetMapping("/provider/{providerId}/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<AvailabilityDTO>>> getAvailabilitiesByProviderIdAndDate(
            @PathVariable Long providerId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AvailabilityDTO> availabilities = availabilityService.getAvailabilitiesByProviderIdAndDate(providerId, date);
        return ResponseEntity.ok(ApiResponse.success(availabilities));
    }

    @PostMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @userService.getCurrentUser().getId() == #providerId)")
    public ResponseEntity<ApiResponse<AvailabilityDTO>> createAvailability(
            @PathVariable Long providerId,
            @Valid @RequestBody AvailabilityDTO availabilityDTO) {
        AvailabilityDTO createdAvailability = availabilityService.createAvailability(availabilityDTO, providerId);
        return new ResponseEntity<>(ApiResponse.success("Availability created successfully", createdAvailability), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @availabilityService.getAvailabilityById(#id).providerId == @userService.getCurrentUser().getId())")
    public ResponseEntity<ApiResponse<AvailabilityDTO>> updateAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityDTO availabilityDTO) {
        AvailabilityDTO updatedAvailability = availabilityService.updateAvailability(id, availabilityDTO);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", updatedAvailability));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @availabilityService.getAvailabilityById(#id).providerId == @userService.getCurrentUser().getId())")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
        return ResponseEntity.ok(ApiResponse.success("Availability deleted successfully", null));
    }

    @GetMapping("/provider/{providerId}/check")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
        LocalTime start = LocalTime.parse(startTime, formatter);
        LocalTime end = LocalTime.parse(endTime, formatter);
        
        boolean isAvailable = availabilityService.isTimeSlotAvailable(providerId, date, start, end);
        
        return ResponseEntity.ok(ApiResponse.success(isAvailable));
    }
}