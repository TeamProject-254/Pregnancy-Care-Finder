package com.teamproject254.pregnancycarefinder.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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
        Patient patient = Patient.builder()
                .id(1L)
                .firstName("Anna")
                .lastName("Smith")
                .location("Warsaw")
                .languages(Set.of("pl"))
                .pregnancyWeek(12)
                .explicitConsent(true)
                .photoUrl("https://example.com/photo.jpg")
                .build();
        PatientResponse expectedResponse = new PatientResponse(1L, "Anna", "Smith", "Warsaw", Set.of("pl"), 12, true, "https://example.com/photo.jpg");

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
        verify(patientMapper, never()).toResponse(any());
    }

    @Test
    void createPatientProfile_ShouldCreateProfile_WhenDataIsValid() {
        String email = "test@patient.com";
        User user = User.builder().id(1L).email(email).build();
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, true);
        Patient patient = Patient.builder().location("Warsaw").pregnancyWeek(12).explicitConsent(true).build();
        Patient savedPatient = Patient.builder().id(1L).location("Warsaw").pregnancyWeek(12).explicitConsent(true).user(user).build();
        PatientResponse expectedResponse = new PatientResponse(1L, "Anna", "Smith", "Warsaw", Set.of("pl"), 12, true, null);

        when(patientRepository.existsByUserEmail(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(patientMapper.toEntity(request)).thenReturn(patient);
        when(patientRepository.save(patient)).thenReturn(savedPatient);
        when(patientMapper.toResponse(savedPatient)).thenReturn(expectedResponse);

        PatientResponse response = patientService.createPatientProfile(email, request);

        assertNotNull(response);
        assertEquals("Warsaw", response.location());
        assertEquals(user, patient.getUser());
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void createPatientProfile_ShouldThrowException_WhenProfileAlreadyExists() {
        String email = "test@patient.com";
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, true);

        when(patientRepository.existsByUserEmail(email)).thenReturn(true);

        ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class,
                () -> patientService.createPatientProfile(email, request));

        assertEquals("Patient profile already exists for this email.", exception.getMessage());
        verify(userRepository, never()).findByEmail(any());
        verify(patientRepository, never()).save(any());
    }

    @Test
    void createPatientProfile_ShouldThrowException_WhenUserNotFound() {
        String email = "test@patient.com";
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, true);

        when(patientRepository.existsByUserEmail(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> patientService.createPatientProfile(email, request));

        verify(patientRepository, never()).save(any());
    }

    @Test
    void createPatientProfile_ShouldThrowException_WhenPregnancyWeekProvidedWithoutConsent() {
        String email = "test@patient.com";
        User user = User.builder().id(1L).email(email).build();
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, false);

        when(patientRepository.existsByUserEmail(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> patientService.createPatientProfile(email, request));

        assertEquals("Explicit consent is required when pregnancy week is set.", exception.getMessage());
        verify(patientRepository, never()).save(any());
    }

    @Test
    void updatePatientProfile_ShouldUpdateData_WhenRequestIsValid() {
        String email = "test@patient.com";
        Patient patient = Patient.builder()
                .id(1L)
                .firstName("Anna")
                .lastName("Smith")
                .location("Warsaw")
                .pregnancyWeek(12)
                .explicitConsent(true)
                .photoUrl("https://example.com/photo.jpg")
                .build();

        PatientUpdateRequest request = new PatientUpdateRequest(null, null, "Cracow", null,null, null, null);
        PatientResponse expectedResponse = new PatientResponse(1L, "Anna", "Smith", "Cracow", Set.of("pl"), 12, true, "https://example.com/photo.jpg");

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(patientRepository.save(patient)).thenReturn(patient);
        when(patientMapper.toResponse(patient)).thenReturn(expectedResponse);

        PatientResponse response = patientService.updatePatientProfile(email, request);

        assertNotNull(response);
        assertEquals("Cracow", response.location());
        verify(patientMapper, times(1)).updatePatientFromRequest(request, patient);
        verify(patientRepository, times(1)).save(patient);
    }

    @Test
    void updatePatientProfile_ShouldThrowException_WhenPatientNotFound() {
        String email = "test@patient.com";
        PatientUpdateRequest request = new PatientUpdateRequest(null, null, "Cracow", null,null, null, null);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> patientService.updatePatientProfile(email, request));

        verify(patientRepository, never()).save(any());
    }

    @Test
    void updatePatientProfile_ShouldThrowException_WhenPregnancyWeekUpdatedWithoutConsent() {
        String email = "test@patient.com";
        Patient patient = Patient.builder()
                .id(1L)
                .pregnancyWeek(null)
                .explicitConsent(false)
                .build();

        PatientUpdateRequest request = new PatientUpdateRequest(null, null, null, null, 14, null, null);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> patientService.updatePatientProfile(email, request));

        assertEquals("Explicit consent is required when pregnancy week is set.", exception.getMessage());
        verify(patientMapper, never()).updatePatientFromRequest(any(), any());
        verify(patientRepository, never()).save(any());
    }
}