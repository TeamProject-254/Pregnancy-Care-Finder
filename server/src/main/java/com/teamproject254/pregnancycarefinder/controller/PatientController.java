package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.PatientCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;
import com.teamproject254.pregnancycarefinder.service.PatientService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
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
    @PostMapping("/profile")
    @ResponseStatus(HttpStatus.CREATED)
    public PatientResponse createPatientProfile(Principal principal,
                                                        @RequestBody @Valid
                                                        PatientCreateRequest request) {
        String email =  principal.getName();
        return patientService.createPatientProfile(email, request);
    }

    @PreAuthorize("hasRole('PATIENT')")
    @PatchMapping("/profile")
    public PatientResponse updatePatientProfile(Principal principal,
                                                @RequestBody @Valid
                                                PatientUpdateRequest request) {
        String email =  principal.getName();
        return patientService.updatePatientProfile(email, request);
    }
}
