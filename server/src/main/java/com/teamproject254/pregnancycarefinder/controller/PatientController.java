package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.PatientProfileRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientProfileResponse;
import com.teamproject254.pregnancycarefinder.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/{userId}")
    public PatientProfileResponse getPatientProfile(@PathVariable Long userId) {
        return patientService.getPatientProfile(userId);
    }

    @PatchMapping("/{userId}")
    public PatientProfileResponse updateOrCreatePatientProfile(@PathVariable Long userId, @RequestBody @Valid
                                                               PatientProfileRequest request) {
        return patientService.updateOrCreatePatientProfile(userId, request);
    }
}
