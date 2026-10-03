package com.teamproject254.pregnancycarefinder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.ProviderRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.ServiceResponse;
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
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProviderController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProviderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean private
    UserDetailsService userDetailsService;

    @MockBean
    private ProviderService providerService;

    private final Principal principal = () -> "test@provider.com";

    @Test
    void getProviderProfile_shouldReturn200_whenProfileExists() throws Exception {
        String email = "test@provider.com";
        ProviderResponse response = new ProviderResponse(
                1L, "Dr. Sarah Jenkins", "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw", "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.", "+48 500 600 700",
                "MED-987654", Set.of("English", "Polish"), List.of()
        );

        when(providerService.getProviderProfile(email)).thenReturn(response);

        mockMvc.perform(get("/providers/profile")
                        .principal(principal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Dr. Sarah Jenkins"));
    }

    @Test
    void getProviderProfile_shouldReturn404_whenProfileNotFound() throws Exception {
        String email = "test@provider.com";
        when(providerService.getProviderProfile(email))
                .thenThrow(new ResourceNotFoundException("Provider not found"));

        mockMvc.perform(get("/providers/profile")
                        .principal(principal))
                .andExpect(status().isNotFound());
    }

    @Test
    void createOrUpdateProviderProfile_shouldReturn200_whenRequestIsValid() throws Exception {
        String email = "test@provider.com";
        ProviderRequest request = new ProviderRequest(
                "Dr. Sarah Jenkins", "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw", "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.", "+48 500 600 700",
                "MED-987654", Set.of("English"), List.of(new ServiceRequest("Consultation", 30))
        );

        ProviderResponse response = new ProviderResponse(
                1L, "Dr. Sarah Jenkins", "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw", "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.", "+48 500 600 700",
                "MED-987654", Set.of("English"), List.of(new ServiceResponse(1L, "Consultation", 30))
        );

        when(providerService.createOrUpdateProviderProfile(eq(email), any(ProviderRequest.class)))
                .thenReturn(response);

        mockMvc.perform(patch("/providers/profile")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void getPublicProviderById_shouldReturn404_whenNotFound() throws Exception {
        Long providerId = 42L;
        when(providerService.getPublicProviderById(providerId))
                .thenThrow(new ResourceNotFoundException("Provider not found"));

        mockMvc.perform(get("/providers/{providerId}", providerId))
                .andExpect(status().isNotFound());
    }

    @Test
    void searchProviders_shouldReturnEmptyList_whenNoResultsFound() throws Exception {
        when(providerService.searchProviders(any(), any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/providers/search")
                        .param("location", "NonexistentCity"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.size()").value(0));
    }
}