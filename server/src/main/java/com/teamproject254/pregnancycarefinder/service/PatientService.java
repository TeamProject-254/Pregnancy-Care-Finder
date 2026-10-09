package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;

public interface PatientService {

    PatientResponse getPatientProfile(String email);

    PatientResponse createPatientProfile(String email, PatientCreateRequest request);

    PatientResponse updatePatientProfile(String email, PatientUpdateRequest request);
}
