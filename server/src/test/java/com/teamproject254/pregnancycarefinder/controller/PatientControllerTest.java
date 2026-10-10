package com.teamproject254.pregnancycarefinder.controller;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.PatientCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import com.teamproject254.pregnancycarefinder.service.PatientService;
import java.security.Principal;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PatientController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private PatientService patientService;

    @Autowired
    private ObjectMapper objectMapper;

    private final Principal principal = () -> "test@patient.com";

    @Test
    void getPatientProfile_ShouldReturnProfile_WhenPatientExists() throws Exception {
        String email = "test@patient.com";
        PatientResponse response = new PatientResponse(1L, "Anna", "Smith", "Warsaw", Set.of("pl"), 12, true, "https://example.com/photo.jpg");

        when(patientService.getPatientProfile(email)).thenReturn(response);

        mockMvc.perform(get("/patients/profile")
                        .principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Anna"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.location").value("Warsaw"))
                .andExpect(jsonPath("$.languages", hasItem("pl")))
                .andExpect(jsonPath("$.pregnancyWeek").value(12))
                .andExpect(jsonPath("$.explicitConsent").value(true))
                .andExpect(jsonPath("$.photoUrl").value("https://example.com/photo.jpg"));
    }

    @Test
    void getPatientProfile_ShouldReturnNotFound_WhenPatientDoesNotExist() throws Exception {
        String email = "test@patient.com";

        when(patientService.getPatientProfile(email)).thenThrow(new ResourceNotFoundException("Patient not found."));

        mockMvc.perform(get("/patients/profile")
                        .principal(principal))
                .andExpect(status().isNotFound());
    }

    @Test
    void createPatientProfile_ShouldReturnCreatedProfile_WhenRequestIsValid() throws Exception {
        String email = "test@patient.com";
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, true);
        PatientResponse response = new PatientResponse(1L, "Anna", "Smith", "Warsaw", Set.of("pl"), 12, true, null);

        when(patientService.createPatientProfile(eq(email), any(PatientCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Anna"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.location").value("Warsaw"))
                .andExpect(jsonPath("$.pregnancyWeek").value(12))
                .andExpect(jsonPath("$.explicitConsent").value(true));
    }

    @Test
    void createPatientProfile_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        PatientCreateRequest invalidRequest = new PatientCreateRequest("", "", null, null, null, null);

        mockMvc.perform(post("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(patientService, never()).createPatientProfile(any(), any());
    }

    @Test
    void createPatientProfile_ShouldReturnConflict_WhenProfileAlreadyExists() throws Exception {
        String email = "test@patient.com";
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, true);

        when(patientService.createPatientProfile(eq(email), any(PatientCreateRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Patient profile already exists for this email"));

        mockMvc.perform(post("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void createPatientProfile_ShouldReturnBadRequest_WhenPregnancyWeekWithoutConsent() throws Exception {
        String email = "test@patient.com";
        PatientCreateRequest request = new PatientCreateRequest("Anna", "Smith", "Warsaw", Set.of("pl"), 12, false);

        when(patientService.createPatientProfile(eq(email), any(PatientCreateRequest.class)))
                .thenThrow(new IllegalArgumentException("Explicit consent is required when pregnancy week is set"));

        mockMvc.perform(post("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updatePatientProfile_ShouldReturnUpdatedProfile_WhenRequestIsValid() throws Exception {
        String email = "test@patient.com";
        PatientUpdateRequest request = new PatientUpdateRequest(null, null, "Cracow", null, null, null, null);
        PatientResponse response = new PatientResponse(1L, "Anna", "Smith", "Cracow", Set.of("pl"), 12, true, "https://example.com/photo.jpg");

        when(patientService.updatePatientProfile(eq(email), any(PatientUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Cracow"))
                .andExpect(jsonPath("$.firstName").value("Anna"))
                .andExpect(jsonPath("$.pregnancyWeek").value(12))
                .andExpect(jsonPath("$.explicitConsent").value(true))
                .andExpect(jsonPath("$.photoUrl").value("https://example.com/photo.jpg"));
    }

    @Test
    void updatePatientProfile_ShouldReturnBadRequest_WhenPregnancyWeekWithoutConsent() throws Exception {
        String email = "test@patient.com";
        PatientUpdateRequest request = new PatientUpdateRequest(null, null, null, null, 14, false, null);

        when(patientService.updatePatientProfile(eq(email), any(PatientUpdateRequest.class)))
                .thenThrow(new IllegalArgumentException("Explicit consent is required when pregnancy week is set"));

        mockMvc.perform(patch("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
