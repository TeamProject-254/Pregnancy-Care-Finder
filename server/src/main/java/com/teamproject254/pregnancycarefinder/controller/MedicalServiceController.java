package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import com.teamproject254.pregnancycarefinder.service.MedicalServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class MedicalServiceController {
    private final MedicalServiceService medicalServiceService;

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public MedicalServiceResponse createService(@Valid @RequestBody MedicalServiceRequest request) {
        return medicalServiceService.createService(request);
    }

    @PutMapping("/{serviceId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public MedicalServiceResponse updateService(@PathVariable Long serviceId, @Valid @RequestBody MedicalServiceRequest request) {
        return medicalServiceService.updateService(serviceId, request);
    }

    @DeleteMapping("/{serviceId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public void deleteService(@PathVariable Long serviceId) {
        medicalServiceService.deleteService(serviceId);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<MedicalServiceResponse> getMyServices(Pageable pageable) {
        return medicalServiceService.getMyServices(pageable);
    }

    @GetMapping("/{serviceId}")
    public MedicalServiceResponse getServiceById(@PathVariable Long serviceId) {
        return medicalServiceService.getServiceById(serviceId);
    }

    @GetMapping
    public Page<MedicalServiceResponse> getAllServices(Pageable pageable) {
        return medicalServiceService.getAllServices(pageable);
    }

    @GetMapping("/search")
    public Page<MedicalServiceResponse> searchServices(@RequestParam String name, Pageable pageable) {
        return medicalServiceService.searchServices(pageable, name);
    }
}
