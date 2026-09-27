package com.teamproject254.pregnancycarefinder.controller;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.PatientProfileRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientProfileResponse;
import com.teamproject254.pregnancycarefinder.service.PatientService;
import jakarta.persistence.EntityNotFoundException;
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
    private PatientService patientService;

    @MockBean
    private com.teamproject254.pregnancycarefinder.security.JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getPatientProfile_ShouldReturnProfile_WhenPatientExists() throws Exception {
    Long userId = 1L;
    PatientProfileResponse response = new PatientProfileResponse("Warsaw" , Set.of("pl"), 12, true);

    when(patientService.getPatientProfile(userId)).thenReturn(response);

    mockMvc.perform(get("/patient/{userId}", userId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.location").value("Warsaw"))
            .andExpect(jsonPath("$.languages").value("pl"))
            .andExpect(jsonPath("$.pregnancyWeek").value(12))
            .andExpect(jsonPath("$.explicitConsent").value(true));
    }

    @Test
    void getPatientProfile_ShouldReturnEntityNotFound_WhenPatientNotFound() throws Exception {
        Long userId = 1L;

        when(patientService.getPatientProfile(userId)).thenThrow(new EntityNotFoundException("Patient not found."));

        mockMvc.perform(get("/patient/{userId}", userId))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateOrCreatePatientProfile_ShouldReturnUpdatedProfile_WhenPatientExists() throws Exception {
        Long userId = 1L;
        PatientProfileRequest request = new PatientProfileRequest("Cracow", null, null, null);
        PatientProfileResponse response = new PatientProfileResponse("Cracow" , Set.of("pl"), 12, true);

        when(patientService.updateOrCreatePatientProfile(eq(userId), any(PatientProfileRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/patient/{userId}", userId)
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
        Long userId = 1L;
        PatientProfileRequest request = new PatientProfileRequest("Cracow", null, 12, false);

        when(patientService.updateOrCreatePatientProfile(eq(userId), any(PatientProfileRequest.class))).thenThrow(new IllegalArgumentException("Explicit consent is required to save pregnancy week."));

        mockMvc.perform(patch("/patient/{userId}", userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
