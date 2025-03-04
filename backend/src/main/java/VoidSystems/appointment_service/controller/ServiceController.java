package VoidSystems.appointment_service.controller;

import java.util.List;

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

import VoidSystems.appointment_service.dto.common.ApiResponse;
import VoidSystems.appointment_service.dto.service.ServiceDTO;
import VoidSystems.appointment_service.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getAllServices(
            @RequestParam(required = false) Boolean activeOnly) {
        List<ServiceDTO> services;
        if (activeOnly != null && activeOnly) {
            services = serviceService.getAllActiveServices();
        } else {
            services = serviceService.getAllServices();
        }
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ServiceDTO>> getServiceById(@PathVariable Long id) {
        ServiceDTO service = serviceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROVIDER') or hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<ServiceDTO>>> getServicesByProviderId(
            @PathVariable Long providerId,
            @RequestParam(required = false) Boolean activeOnly) {
        List<ServiceDTO> services;
        if (activeOnly != null && activeOnly) {
            services = serviceService.getActiveServicesByProviderId(providerId);
        } else {
            services = serviceService.getServicesByProviderId(providerId);
        }
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @PostMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @userService.getCurrentUser().getId() == #providerId)")
    public ResponseEntity<ApiResponse<ServiceDTO>> createService(
            @PathVariable Long providerId,
            @Valid @RequestBody ServiceDTO serviceDTO) {
        ServiceDTO createdService = serviceService.createService(serviceDTO, providerId);
        return new ResponseEntity<>(ApiResponse.success("Service created successfully", createdService), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @serviceService.getServiceById(#id).providerId == @userService.getCurrentUser().getId())")
    public ResponseEntity<ApiResponse<ServiceDTO>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceDTO serviceDTO) {
        ServiceDTO updatedService = serviceService.updateService(id, serviceDTO);
        return ResponseEntity.ok(ApiResponse.success("Service updated successfully", updatedService));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @serviceService.getServiceById(#id).providerId == @userService.getCurrentUser().getId())")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @serviceService.getServiceById(#id).providerId == @userService.getCurrentUser().getId())")
    public ResponseEntity<ApiResponse<Void>> activateService(@PathVariable Long id) {
        serviceService.activateService(id);
        return ResponseEntity.ok(ApiResponse.success("Service activated successfully", null));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PROVIDER') and @serviceService.getServiceById(#id).providerId == @userService.getCurrentUser().getId())")
    public ResponseEntity<ApiResponse<Void>> deactivateService(@PathVariable Long id) {
        serviceService.deactivateService(id);
        return ResponseEntity.ok(ApiResponse.success("Service deactivated successfully", null));
    }
}