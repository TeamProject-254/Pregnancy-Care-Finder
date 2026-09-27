package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientProfileRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientProfileResponse;
import com.teamproject254.pregnancycarefinder.model.Patient;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.PatientRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService{

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PatientProfileResponse getPatientProfile(Long userId) {
       Patient patient = patientRepository.findByUserId(userId).orElseThrow(() -> new EntityNotFoundException("Patient not found."));

       return mapToResponse(patient);
    }

    @Override
    public PatientProfileResponse updateOrCreatePatientProfile(Long userId,
                                                               PatientProfileRequest request) {
        Patient patient = patientRepository.findByUserId(userId).orElseGet(() -> {
            User user =  userRepository.findById(userId)
                    .orElseThrow(() -> new EntityNotFoundException("Patient not found."));

            return Patient.builder()
                    .user(user)
                    .explicitConsent(false)
                    .build();
        });

        if (request.location() != null) {
            patient.setLocation(request.location());
        }
        if (request.languages() != null) {
            patient.setLanguages(request.languages());
        }
        if (request.explicitConsent() != null) {
            patient.setExplicitConsent(request.explicitConsent());
        }
        if (request.pregnancyWeek() != null) {
            if (Boolean.FALSE.equals(patient.getExplicitConsent())) {
                throw new IllegalArgumentException("Explicit consent is required to save pregnancy week.");
            }
            patient.setPregnancyWeek(request.pregnancyWeek());
        }
        Patient savedPatient = patientRepository.save(patient);
        return mapToResponse(savedPatient);
    }

    private PatientProfileResponse mapToResponse(Patient patient) {
        return new PatientProfileResponse(
                patient.getLocation(),
                patient.getLanguages(),
                patient.getPregnancyWeek(),
                patient.getExplicitConsent()
        );
    }
}
