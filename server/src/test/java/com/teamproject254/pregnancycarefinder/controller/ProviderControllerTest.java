package com.teamproject254.pregnancycarefinder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import com.teamproject254.pregnancycarefinder.service.ProviderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.util.Set;

import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProviderController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ProviderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private ProviderService providerService;

    private final Principal principal = () -> "test@provider.com";

    @Test
    void getProviderProfile_ShouldReturnProfile_WhenProviderExists() throws Exception {
        String email = "test@provider.com";
        ProviderResponse response = new ProviderResponse(
                1L, "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", "Gynecology",
                "Specialized in high-risk pregnancies.", Set.of("pl"), "https://example.com/photo.jpg"
        );

        when(providerService.getProviderProfile(email)).thenReturn(response);

        mockMvc.perform(get("/providers/profile")
                        .principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Sarah"))
                .andExpect(jsonPath("$.lastName").value("Jenkins"))
                .andExpect(jsonPath("$.professionalRole").value("Obstetrician-Gynecologist"))
                .andExpect(jsonPath("$.yearsOfExperience").value(5L))
                .andExpect(jsonPath("$.contactPhone").value("123456789"))
                .andExpect(jsonPath("$.address").value("Warsaw"))
                .andExpect(jsonPath("$.specialization").value("Gynecology"))
                .andExpect(jsonPath("$.description").value("Specialized in high-risk pregnancies."))
                .andExpect(jsonPath("$.languages", hasItem("pl")))
                .andExpect(jsonPath("$.photoUrl").value("https://example.com/photo.jpg"));
    }

    @Test
    void getProviderProfile_ShouldReturnNotFound_WhenProviderDoesNotExist() throws Exception {
        String email = "test@provider.com";

        when(providerService.getProviderProfile(email)).thenThrow(new ResourceNotFoundException("Provider profile not found"));

        mockMvc.perform(get("/providers/profile")
                        .principal(principal))
                .andExpect(status().isNotFound());
    }

    @Test
    void createProviderProfile_ShouldReturnCreatedProfile_WhenRequestIsValid() throws Exception {
        String email = "test@provider.com";
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", true, "Obstetrician-Gynecologist", Set.of("English")
        );
        ProviderResponse response = new ProviderResponse(
                1L, "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", null, null, null, null
        );

        when(providerService.createProviderProfile(eq(email), any(ProviderCreateRequest.class))).thenReturn(response);

        mockMvc.perform(post("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.firstName").value("Sarah"))
                .andExpect(jsonPath("$.lastName").value("Jenkins"))
                .andExpect(jsonPath("$.professionalRole").value("Obstetrician-Gynecologist"));
    }

    @Test
    void createProviderProfile_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        ProviderCreateRequest invalidRequest = new ProviderCreateRequest("", "", "", null, "", "", false);

        mockMvc.perform(post("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());

        verify(providerService, never()).createProviderProfile(any(), any());
    }

    @Test
    void createProviderProfile_ShouldReturnConflict_WhenProfileAlreadyExists() throws Exception {
        String email = "test@provider.com";
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", true, "Obstetrician-Gynecologist", Set.of("English")
        );

        when(providerService.createProviderProfile(eq(email), any(ProviderCreateRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("Provider profile already exists for this email"));

        mockMvc.perform(post("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    void createProviderProfile_ShouldAllowIncompleteProfileWithoutSpecialityOrLanguages() throws Exception {
        String email = "test@provider.com";
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Doctor", 0L,
                "123456789", "Warsaw", true, null, null
        );

        when(providerService.createProviderProfile(eq(email), any(ProviderCreateRequest.class)))
                .thenReturn(new ProviderResponse(
                        1L, "Sarah", "Jenkins", "Doctor", 0L,
                        "123456789", "Warsaw", null, null, Set.of(), null, false
                ));

        mockMvc.perform(post("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.published").value(false));
    }

    @Test
    void updateProviderProfile_ShouldReturnUpdatedProfile_WhenRequestIsValid() throws Exception {
        String email = "test@provider.com";
        ProviderUpdateRequest request = new ProviderUpdateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 6L,
                "987654321", "Cracow", "Advanced Gynecology",
                "Updated description.", Set.of("pl", "en"), "https://example.com/new-photo.jpg", true
        );
        ProviderResponse response = new ProviderResponse(
                1L, "Sarah", "Jenkins", "Obstetrician-Gynecologist", 6L,
                "987654321", "Cracow", "Advanced Gynecology",
                "Updated description.", Set.of("pl", "en"), "https://example.com/new-photo.jpg", true
        );

        when(providerService.updateProviderProfile(eq(email), any(ProviderUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(patch("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.address").value("Cracow"))
                .andExpect(jsonPath("$.yearsOfExperience").value(6L))
                .andExpect(jsonPath("$.specialization").value("Advanced Gynecology"))
                .andExpect(jsonPath("$.description").value("Updated description."))
                .andExpect(jsonPath("$.languages", hasItem("en")))
                .andExpect(jsonPath("$.photoUrl").value("https://example.com/new-photo.jpg"))
                .andExpect(jsonPath("$.published").value(true));
    }

    @Test
    void updateProviderProfile_ShouldReturnNotFound_WhenProviderDoesNotExist() throws Exception {
        String email = "test@provider.com";
        ProviderUpdateRequest request = new ProviderUpdateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 6L,
                "987654321", "Cracow", "Advanced Gynecology",
                "Updated description.", Set.of("pl", "en"), "https://example.com/new-photo.jpg"
        );

        when(providerService.updateProviderProfile(eq(email), any(ProviderUpdateRequest.class)))
                .thenThrow(new ResourceNotFoundException("Provider profile not found"));

        mockMvc.perform(patch("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}