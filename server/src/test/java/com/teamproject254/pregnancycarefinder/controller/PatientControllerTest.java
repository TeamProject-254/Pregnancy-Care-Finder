package com.teamproject254.pregnancycarefinder.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import com.teamproject254.pregnancycarefinder.service.PatientService;
import jakarta.persistence.EntityNotFoundException;
import java.security.Principal;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PatientController.class)
@AutoConfigureMockMvc(addFilters = false)
public class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private PatientService patientService;

    @Autowired
    private ObjectMapper objectMapper;

    private final Principal principal = () -> "test@patient.com";

    @Test
    void getPatientProfile_ShouldReturnProfile_WhenPatientExists() throws Exception {
        String email = "test@patient.com";
        PatientResponse response = new PatientResponse(1L, "Warsaw", Set.of("pl"), 12, true);

        when(patientService.getPatientProfile(email)).thenReturn(response);

        mockMvc.perform(get("/patients/profile")
                        .principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Warsaw"))
                .andExpect(jsonPath("$.languages[0]").value("pl"))
                .andExpect(jsonPath("$.pregnancyWeek").value(12))
                .andExpect(jsonPath("$.explicitConsent").value(true));
    }

    @Test
    void getPatientProfile_ShouldReturnEntityNotFound_WhenPatientNotFound() throws Exception {
        String email = "test@patient.com";

        when(patientService.getPatientProfile(email)).thenThrow(new EntityNotFoundException("Patient not found."));

        mockMvc.perform(get("/patients/profile")
                        .principal(principal))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateOrCreatePatientProfile_ShouldReturnUpdatedProfile_WhenPatientExists() throws Exception {
        String email = "test@patient.com";
        PatientRequest request = new PatientRequest("Cracow", null, null, true);
        PatientResponse response = new PatientResponse(1L, "Cracow", Set.of("pl"), 12, true);

        when(patientService.updateOrCreatePatientProfile(eq(email), any(PatientRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Cracow"))
                .andExpect(jsonPath("$.languages[0]").value("pl"))
                .andExpect(jsonPath("$.pregnancyWeek").value(12))
                .andExpect(jsonPath("$.explicitConsent").value(true));
    }

    @Test
    void updateOrCreatePatientProfile_ShouldReturnBadRequest_WhenPregnancyWeekWithoutConsent() throws Exception {
        String email = "test@patient.com";
        PatientRequest request = new PatientRequest("Cracow", null, 12, false);

        when(patientService.updateOrCreatePatientProfile(eq(email), any(PatientRequest.class))).thenThrow(new IllegalArgumentException("Explicit consent is required to save pregnancy week."));

        mockMvc.perform(patch("/patients/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
