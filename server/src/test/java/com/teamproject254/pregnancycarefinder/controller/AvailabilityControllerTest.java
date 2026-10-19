package com.teamproject254.pregnancycarefinder.controller;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityRequestDto;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import com.teamproject254.pregnancycarefinder.service.AvailabilityService;
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

import java.security.Principal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@WebMvcTest(AvailabilityController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private AvailabilityService availabilityService;

    private final Principal principal = () -> "test@provider.com";

    private AvailabilityRequestDto createValidRequest() {
        AvailabilityRequestDto request = new AvailabilityRequestDto();
        request.setDate(LocalDate.of(2700, 10, 5));
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(12, 0));
        return request;
    }

    @Test
    void createAvailability_ShouldReturnCreatedAvailability_WhenRequestIsValid()
            throws Exception {

        AvailabilityRequestDto request = createValidRequest();

        AvailabilityResponseDto response = mock(AvailabilityResponseDto.class);
        when(response.getId()).thenReturn(1L);

        when(availabilityService.createAvailability(
                any(AvailabilityRequestDto.class)
        )).thenReturn(response);

        mockMvc.perform(post("/availabilities")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));

        verify(availabilityService)
                .createAvailability(any(AvailabilityRequestDto.class));
    }

    @Test
    void createAvailability_ShouldReturnBadRequest_WhenValidationFails()
            throws Exception {

        AvailabilityRequestDto request = new AvailabilityRequestDto();
        request.setDate(null);
        request.setStartTime(LocalTime.of(9, 0));
        request.setEndTime(LocalTime.of(12, 0));

        mockMvc.perform(post("/availabilities")
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verify(availabilityService, never())
                .createAvailability(any(AvailabilityRequestDto.class));
    }

    @Test
    void getMyUpcomingAvailabilities_ShouldReturnPage_WhenAvailabilitiesExist()
            throws Exception {

        AvailabilityResponseDto response = mock(AvailabilityResponseDto.class);
        when(response.getId()).thenReturn(1L);

        Page<AvailabilityResponseDto> page = new PageImpl<>(
                List.of(response),
                PageRequest.of(0, 10),
                1
        );

        when(availabilityService.getMyUpcomingAvailabilities(
                any(Pageable.class)
        )).thenReturn(page);

        mockMvc.perform(get("/availabilities")
                        .principal(principal)
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1L))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(availabilityService)
                .getMyUpcomingAvailabilities(any(Pageable.class));
    }

    @Test
    void getMyAvailableSlots_ShouldReturnFilteredPage_WhenDatesAreValid()
            throws Exception {

        LocalDate date = LocalDate.of(2026, 11, 1);

        AvailabilityResponseDto response = mock(AvailabilityResponseDto.class);
        when(response.getId()).thenReturn(2L);

        Page<AvailabilityResponseDto> page = new PageImpl<>(
                List.of(response),
                PageRequest.of(0, 10),
                1
        );

        when(availabilityService.getMyAvailableSlotsPerDay(
                any(Pageable.class), eq(date)
        )).thenReturn(page);

        mockMvc.perform(get("/availabilities/date")
                        .principal(principal)
                        .param("page", "0")
                        .param("size", "10")
                        .param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(2L))
                .andExpect(jsonPath("$.totalElements").value(1));

        verify(availabilityService).getMyAvailableSlotsPerDay(
                any(Pageable.class), eq(date)
        );
    }

    @Test
    void updateAvailability_ShouldReturnUpdatedAvailability_WhenRequestIsValid()
            throws Exception {

        Long availabilityId = 10L;
        AvailabilityRequestDto request = createValidRequest();

        AvailabilityResponseDto response = mock(AvailabilityResponseDto.class);
        when(response.getId()).thenReturn(availabilityId);

        when(availabilityService.updateAvailability(
                eq(availabilityId), any(AvailabilityRequestDto.class)
        )).thenReturn(response);

        mockMvc.perform(put("/availabilities/{id}", availabilityId)
                        .principal(principal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(availabilityId));

        verify(availabilityService).updateAvailability(
                eq(availabilityId), any(AvailabilityRequestDto.class)
        );
    }

    @Test
    void deleteAvailability_ShouldReturnOk_WhenAvailabilityIsDeleted()
            throws Exception {

        Long availabilityId = 10L;

        mockMvc.perform(delete("/availabilities/{id}", availabilityId)
                        .principal(principal))
                .andExpect(status().isOk());

        verify(availabilityService).deleteAvailability(availabilityId);
    }
}
