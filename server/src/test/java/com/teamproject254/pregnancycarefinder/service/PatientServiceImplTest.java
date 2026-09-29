package com.teamproject254.pregnancycarefinder.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
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

    @InjectMocks
    private PatientServiceImpl patientService;

    @Test
    void getPatientProfile_ShouldReturnPatientProfile_WhenPatientExist() {
        String email = "test@patient.com";
        Patient patient = Patient.builder()
                .id(1L)
                .location("Warsaw")
                .languages(Set.of("pl", "en"))
                .pregnancyWeek(12)
                .explicitConsent(true)
                .build();

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));

        PatientResponse response = patientService.getPatientProfile(email);

        assertNotNull(response);
        assertEquals("Warsaw", response.location());
        assertEquals(Set.of("pl", "en"), response.languages());
        assertEquals(12, response.pregnancyWeek());
        assertTrue(response.explicitConsent());
    }

    @Test
    void getPatientProfile_ShouldThrownException_WhenPatientNotFound() {
        String email = "test@patient.com";

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> patientService.getPatientProfile(email));
    }

    @Test
    void updateOrCreatePatientProfile_ShouldUpdateExistingData_WhenPatientAlreadyExists() {
        String email = "test@patient.com";
        Patient patient = Patient.builder()
                .id(1L)
                .location("Warsaw")
                .languages(Set.of("pl", "en"))
                .pregnancyWeek(12)
                .explicitConsent(true)
                .build();

        PatientRequest request = new PatientRequest("Cracow", null, null, null);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(patientRepository.save(any(Patient.class))).thenAnswer(
                invocation -> invocation.getArgument(0));

        PatientResponse response =
                patientService.updateOrCreatePatientProfile(email, request);

        assertNotNull(response);
        assertEquals("Cracow", response.location());

        verify(patientRepository).save(patient);
    }

    @Test
    void updateOrCreatePatientProfile_ShouldCreateNewProfile_WhenPatientDoesNotExists() {
        String email = "test@patient.com";
        User user = User.builder().id(1L).email(email).build();

        PatientRequest request = new PatientRequest("Warsaw", Set.of("pl"), 12, true);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        when(patientRepository.save(any(Patient.class))).thenAnswer(
                invocation -> invocation.getArgument(0));

        PatientResponse response = patientService.updateOrCreatePatientProfile(email, request);

        assertNotNull(response);
        assertEquals("Warsaw", response.location());
        assertEquals(Set.of("pl"), response.languages());
        assertEquals(12, response.pregnancyWeek());
        assertTrue(response.explicitConsent());

        verify(patientRepository).save(any(Patient.class));
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

        assertEquals("Explicit consent is required to save pregnancy week.",
                exception.getMessage());
        verify(patientRepository, never()).save(any());
    }
}