package VoidSystems.appointment_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller for health check endpoints.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    /**
     * Simple health check endpoint.
     * 
     * @return A response with status information
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Detailed health check endpoint with system information.
     * 
     * @return A response with detailed system information
     */
    @GetMapping("/details")
    public ResponseEntity<Map<String, Object>> healthCheckDetails() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        
        // Add system information
        Map<String, Object> systemInfo = new HashMap<>();
        systemInfo.put("javaVersion", System.getProperty("java.version"));
        systemInfo.put("javaVendor", System.getProperty("java.vendor"));
        systemInfo.put("osName", System.getProperty("os.name"));
        systemInfo.put("osVersion", System.getProperty("os.version"));
        systemInfo.put("osArch", System.getProperty("os.arch"));
        systemInfo.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        systemInfo.put("freeMemory", Runtime.getRuntime().freeMemory());
        systemInfo.put("totalMemory", Runtime.getRuntime().totalMemory());
        systemInfo.put("maxMemory", Runtime.getRuntime().maxMemory());
        
        response.put("system", systemInfo);
        
        // Add application information
        Map<String, Object> appInfo = new HashMap<>();
        appInfo.put("name", "Appointment Scheduling System");
        appInfo.put("version", "1.0.0");
        appInfo.put("description", "A comprehensive appointment scheduling service");
        
        response.put("application", appInfo);
        
        return ResponseEntity.ok(response);
    }
} 