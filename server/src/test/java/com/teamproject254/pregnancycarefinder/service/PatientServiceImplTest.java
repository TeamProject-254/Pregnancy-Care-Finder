package com.teamproject254.pregnancycarefinder.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.PatientMapper;
import com.teamproject254.pregnancycarefinder.model.Patient;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.PatientRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class PatientServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientMapper patientMapper;

    @InjectMocks
    private PatientServiceImpl patientService;

    @Test
    void getPatientProfile_ShouldReturnPatientProfile_WhenPatientExists() {
        String email = "test@patient.com";
        Patient patient = Patient.builder().id(1L).location("Warsaw").build();
        PatientResponse expectedResponse = new PatientResponse(1L, "Warsaw", Set.of("pl"), 12, true);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(patientMapper.toResponse(patient)).thenReturn(expectedResponse);

        PatientResponse response = patientService.getPatientProfile(email);

        assertNotNull(response);
        assertEquals("Warsaw", response.location());
        verify(patientMapper, times(1)).toResponse(patient);
    }

    @Test
    void getPatientProfile_ShouldThrowException_WhenPatientNotFound() {
        String email = "test@patient.com";

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> patientService.getPatientProfile(email));
    }

    @Test
    void updateOrCreatePatientProfile_ShouldUpdateExistingData_WhenPatientAlreadyExists() {
        String email = "test@patient.com";
        Patient patient = Patient.builder()
                .id(1L)
                .location("Warsaw")
                .pregnancyWeek(12)
                .explicitConsent(true)
                .build();

        PatientRequest request = new PatientRequest("Cracow", null, null, null);
        PatientResponse expectedResponse = new PatientResponse(1L, "Cracow", Set.of("pl"), 12, true);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenReturn(patient);
        when(patientMapper.toResponse(patient)).thenReturn(expectedResponse);

        PatientResponse response = patientService.updateOrCreatePatientProfile(email, request);

        assertNotNull(response);
        assertEquals("Cracow", response.location());

        verify(patientMapper, times(1)).updatePatientFromRequest(request, patient);
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void updateOrCreatePatientProfile_ShouldCreateNewProfile_WhenPatientDoesNotExist() {
        String email = "test@patient.com";
        User user = User.builder().id(1L).email(email).build();

        PatientRequest request = new PatientRequest("Warsaw", Set.of("pl"), 12, true);
        PatientResponse expectedResponse = new PatientResponse(1L, "Warsaw", Set.of("pl"), 12, true);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(patientRepository.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));
        when(patientMapper.toResponse(any(Patient.class))).thenReturn(expectedResponse);

        PatientResponse response = patientService.updateOrCreatePatientProfile(email, request);

        assertNotNull(response);
        assertEquals("Warsaw", response.location());

        verify(userRepository, times(1)).findByEmail(email);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    void updateOrCreatePatientProfile_ShouldThrowException_WhenPregnancyWeekSavedWithoutConsent() {
        String email = "test@patient.com";
        Patient patient = Patient.builder()
                .id(1L)
                .explicitConsent(false)
                .build();

        PatientRequest request = new PatientRequest("Warsaw", Set.of("pl"), 12, null);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> patientService.updateOrCreatePatientProfile(email, request));

        assertEquals("Explicit consent is required when pregnancy week is set.", exception.getMessage());

        verify(patientMapper, never()).updatePatientFromRequest(any(), any());
        verify(patientRepository, never()).save(any());
    }
}