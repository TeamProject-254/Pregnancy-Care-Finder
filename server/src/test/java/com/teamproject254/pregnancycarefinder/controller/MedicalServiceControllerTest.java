package com.teamproject254.pregnancycarefinder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import com.teamproject254.pregnancycarefinder.service.MedicalServiceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MedicalServiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class MedicalServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private  JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private MedicalServiceService medicalServiceService;

    private final Principal principal = () -> "test@provider.com";

    private MedicalServiceRequest createValidRequest() {
        MedicalServiceRequest request = new MedicalServiceRequest();
        request.setName("Consultation");
        request.setDurationMinutes(30);
        request.setPrice(BigDecimal.valueOf(50));
        return request;
    }

    @Test
    void createService_ShouldReturnCreatedService_WhenRequestIsValid() throws Exception {
        MedicalServiceRequest request = createValidRequest();

        MedicalServiceResponse response = MedicalServiceResponse.builder()
                .id(1L)
                .name("Consultation")
                .durationMinutes(30)
                .price(BigDecimal.valueOf(50))
                .providerId(10L)
                .build();

        when(medicalServiceService.createService(any(MedicalServiceRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/services")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Consultation"))
                .andExpect(jsonPath("$.durationMinutes").value(30))
                .andExpect(jsonPath("$.price").value(50))
                .andExpect(jsonPath("$.providerId").value(10L));

        verify(medicalServiceService)
                .createService(any(MedicalServiceRequest.class));
    }

    @Test
    void createService_ShouldReturnBadRequest_WhenValidationFails() throws Exception {
        MedicalServiceRequest request = new MedicalServiceRequest();
        request.setName("");
        request.setDurationMinutes(0);
        request.setPrice(null);

        mockMvc.perform(post("/services")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(medicalServiceService, never())
                .createService(any(MedicalServiceRequest.class));
    }

    @Test
    void updateService_ShouldReturnUpdatedService_WhenRequestIsValid() throws Exception {
        Long serviceId = 1L;

        MedicalServiceRequest request = createValidRequest();
        request.setName("Updated consultation");
        request.setDurationMinutes(45);
        request.setPrice(BigDecimal.valueOf(70));

        MedicalServiceResponse response = MedicalServiceResponse.builder()
                .id(serviceId)
                .name("Updated consultation")
                .durationMinutes(45)
                .price(BigDecimal.valueOf(70))
                .providerId(10L)
                .build();

        when(medicalServiceService.updateService(
                eq(serviceId), any(MedicalServiceRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/services/{serviceId}", serviceId)
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.name").value("Updated consultation"))
                .andExpect(jsonPath("$.durationMinutes").value(45))
                .andExpect(jsonPath("$.price").value(70))
                .andExpect(jsonPath("$.providerId").value(10L));

        verify(medicalServiceService)
                .updateService(eq(serviceId), any(MedicalServiceRequest.class));
    }

    @Test
    void updateService_ShouldReturnNotFound_WhenServiceDoesNotExist() throws Exception {
        Long serviceId = 99L;
        MedicalServiceRequest request = createValidRequest();

        when(medicalServiceService.updateService(
                eq(serviceId), any(MedicalServiceRequest.class)))
                .thenThrow(new ResourceNotFoundException("Medical service not found"));

        mockMvc.perform(put("/services/{serviceId}", serviceId)
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteService_ShouldReturnOk_WhenServiceIsDeleted() throws Exception {
        Long serviceId = 1L;

        mockMvc.perform(delete("/services/{serviceId}", serviceId)
                        .principal(principal))
                .andExpect(status().isOk());

        verify(medicalServiceService).deleteService(serviceId);
    }

    @Test
    void getMyServices_ShouldReturnServices_WhenProviderHasServices() throws Exception {
        MedicalServiceResponse response = MedicalServiceResponse.builder()
                .id(1L)
                .name("Consultation")
                .durationMinutes(30)
                .price(BigDecimal.valueOf(50))
                .providerId(10L)
                .build();

        Page<MedicalServiceResponse> page = new PageImpl<>(
                List.of(response),
                PageRequest.of(0, 10),
                1
        );

        when(medicalServiceService.getMyServices(any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/services/my")
                        .principal(principal)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.content[0].name").value("Consultation"))
                .andExpect(jsonPath("$.content[0].durationMinutes").value(30))
                .andExpect(jsonPath("$.content[0].price").value(50))
                .andExpect(jsonPath("$.content[0].providerId").value(10L))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(medicalServiceService).getMyServices(any(Pageable.class));
    }
}
