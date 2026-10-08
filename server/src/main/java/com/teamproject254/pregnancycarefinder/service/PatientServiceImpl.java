package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
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
               .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
       return patientMapper.toResponse(patient);
    }

    @Override
    public PatientResponse createPatientProfile(String email, PatientCreateRequest request) {
        if (patientRepository.existsByUserEmail(email)) {
            throw new ResourceAlreadyExistsException("Patient profile already exists for this email");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        boolean hasConsent = Boolean.TRUE.equals(request.explicitConsent());
        if (request.pregnancyWeek() != null && !hasConsent) {
            throw new IllegalArgumentException("Explicit consent is required when pregnancy week is set");
        }

        Patient patient = patientMapper.toEntity(request);
        patient.setUser(user);

        Patient savedPatient = patientRepository.save(patient);
        return patientMapper.toResponse(savedPatient);
    }

    @Override
    public PatientResponse updatePatientProfile(String email, PatientUpdateRequest request) {
        Patient patient = patientRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Integer effectiveWeek = request.pregnancyWeek() != null
                ? request.pregnancyWeek()
                : patient.getPregnancyWeek();

        boolean effectiveConsent = request.explicitConsent() != null
                ? request.explicitConsent()
                : patient.getExplicitConsent();

        if (effectiveWeek != null && !effectiveConsent) {
            throw new IllegalArgumentException("Explicit consent is required when pregnancy week is set");
        }

        patientMapper.updatePatientFromRequest(request, patient);
        Patient updatedPatient = patientRepository.save(patient);
        return patientMapper.toResponse(updatedPatient);
    }
}
