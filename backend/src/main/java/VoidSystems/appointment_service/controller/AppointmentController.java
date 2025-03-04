package VoidSystems.appointment_service.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

import VoidSystems.appointment_service.dto.appointment.AppointmentDTO;
import VoidSystems.appointment_service.dto.common.ApiResponse;
import VoidSystems.appointment_service.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAllAppointments() {
        List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO>> getAppointmentById(@PathVariable Long id) {
        AppointmentDTO appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and @userService.getCurrentUser().getId() == #clientId)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByClientId(
            @PathVariable Long clientId,
            @RequestParam(required = false) Boolean upcoming) {
        List<AppointmentDTO> appointments;
        
        if (upcoming != null && upcoming) {
            appointments = appointmentService.getUpcomingAppointmentsByClientId(clientId);
        } else {
            appointments = appointmentService.getAppointmentsByClientId(clientId);
        }
        
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @userService.getCurrentUser().getId() == #providerId)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByProviderId(
            @PathVariable Long providerId,
            @RequestParam(required = false) Boolean upcoming) {
        List<AppointmentDTO> appointments;
        
        if (upcoming != null && upcoming) {
            appointments = appointmentService.getUpcomingAppointmentsByProviderId(providerId);
        } else {
            appointments = appointmentService.getAppointmentsByProviderId(providerId);
        }
        
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByServiceId(@PathVariable Long serviceId) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByServiceId(serviceId);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByStatus(@PathVariable String status) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/provider/{providerId}/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @userService.getCurrentUser().getId() == #providerId)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByProviderIdAndDate(
            @PathVariable Long providerId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByProviderIdAndDate(providerId, date);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/client/{clientId}/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and @userService.getCurrentUser().getId() == #clientId)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByClientIdAndDate(
            @PathVariable Long clientId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByClientIdAndDate(clientId, date);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/provider/{providerId}/range")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @userService.getCurrentUser().getId() == #providerId)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByProviderIdAndDateRange(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByProviderIdAndDateRange(providerId, startDateTime, endDateTime);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/client/{clientId}/range")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and @userService.getCurrentUser().getId() == #clientId)")
    public ResponseEntity<ApiResponse<List<AppointmentDTO>>> getAppointmentsByClientIdAndDateRange(
            @PathVariable Long clientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {
        List<AppointmentDTO> appointments = appointmentService.getAppointmentsByClientIdAndDateRange(clientId, startDateTime, endDateTime);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> createAppointment(@Valid @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO createdAppointment = appointmentService.createAppointment(appointmentDTO);
        return new ResponseEntity<>(ApiResponse.success("Appointment created successfully", createdAppointment), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDTO appointmentDTO) {
        AppointmentDTO updatedAppointment = appointmentService.updateAppointment(id, appointmentDTO);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated successfully", updatedAppointment));
    }

    @PutMapping("/{id}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<AppointmentDTO>> updateAppointmentStatus(
            @PathVariable Long id,
            @PathVariable String status) {
        AppointmentDTO updatedAppointment = appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Appointment status updated successfully", updatedAppointment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted successfully", null));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkAvailability(
            @RequestParam Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDateTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDateTime) {
        boolean isAvailable = appointmentService.isTimeSlotAvailable(providerId, startDateTime, endDateTime);
        return ResponseEntity.ok(ApiResponse.success(isAvailable));
    }
}