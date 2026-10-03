package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.service.PatientService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @PreAuthorize("hasRole('PATIENT')")
    @GetMapping("/profile")
    public PatientResponse getPatientProfile(Principal principal) {
        String email = principal.getName();
        return patientService.getPatientProfile(email);
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PatchMapping("/profile")
    public PatientResponse updateOrCreatePatientProfile(Principal principal,
                                                        @RequestBody @Valid PatientRequest request) {
        String email =  principal.getName();
        return patientService.updateOrCreatePatientProfile(email, request);
    }
}
