package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;

public interface PatientService {

    PatientResponse getPatientProfile(String email);

    PatientResponse updateOrCreatePatientProfile(String email, PatientRequest request);
}
