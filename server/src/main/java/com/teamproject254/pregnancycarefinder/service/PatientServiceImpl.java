package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.PatientMapper;
import com.teamproject254.pregnancycarefinder.model.Patient;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.PatientRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PatientServiceImpl implements PatientService{

    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final PatientMapper patientMapper;

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getPatientProfile(String email) {
       Patient patient = patientRepository.findByUserEmail(email)
               .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));
       return patientMapper.toResponse(patient);
    }

    @Override
    public PatientResponse updateOrCreatePatientProfile(String email,
                                                        PatientRequest request) {
        Patient patient = patientRepository.findByUserEmail(email).orElseGet(() -> {
            User user =  userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient not found."));

            return Patient.builder()
                    .user(user)
                    .explicitConsent(false)
                    .build();
        });

        Integer effectivePregnancyWeek = request.pregnancyWeek() != null
                ? request.pregnancyWeek()
                : patient.getPregnancyWeek();

        boolean effectiveConsent = request.explicitConsent() != null
                ? request.explicitConsent()
                : Boolean.TRUE.equals(patient.getExplicitConsent());

        if (effectivePregnancyWeek != null && !effectiveConsent) {
            throw new IllegalArgumentException("Explicit consent is required when pregnancy week is set.");
        }

        patientMapper.updatePatientFromRequest(request, patient);
        Patient savedPatient = patientRepository.save(patient);
        return patientMapper.toResponse(savedPatient);
    }
}
