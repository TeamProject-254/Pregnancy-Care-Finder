package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientProfileRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientProfileResponse;

public interface PatientService {

    PatientProfileResponse getPatientProfile(Long userId);

    PatientProfileResponse updateOrCreatePatientProfile(Long userId, PatientProfileRequest request);
}
