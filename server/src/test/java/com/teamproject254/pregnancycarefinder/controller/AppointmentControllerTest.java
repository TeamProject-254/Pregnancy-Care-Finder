package com.teamproject254.pregnancycarefinder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamproject254.pregnancycarefinder.dto.AppointmentCancelRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderDashboardStatsResponse;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import com.teamproject254.pregnancycarefinder.security.SecurityConfig;
import com.teamproject254.pregnancycarefinder.service.AppointmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@Import(SecurityConfig.class)
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldCreateAppointmentSuccessfully() throws Exception {
        AppointmentCreateRequest request = new AppointmentCreateRequest(1L, 1L, 1L, LocalDateTime.now().plusDays(1));
        AppointmentResponse response = new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null
        );

        when(appointmentService.createAppointment(any(), any())).thenReturn(response);

        mockMvc.perform(post("/appointments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldForbiddenWhenProviderTriesToCreateAppointment() throws Exception {
        AppointmentCreateRequest request = new AppointmentCreateRequest(1L, 1L, 1L, LocalDateTime.now().plusDays(1));

        mockMvc.perform(post("/appointments")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldGetPatientAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getPatientAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/patient"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldForbiddenWhenPatientAppointmentsAccessedByProvider() throws Exception {
        mockMvc.perform(get("/appointments/patient"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldGetProviderAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getProviderAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/provider"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenProviderAppointmentsAccessedByPatient() throws Exception {
        mockMvc.perform(get("/appointments/provider"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldGetPatientAppointmentDetailsSuccessfully() throws Exception {
        AppointmentResponse response = new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null
        );
        when(appointmentService.getPatientAppointmentDetails(any(), eq(1L))).thenReturn(response);

        mockMvc.perform(get("/appointments/patient/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldForbiddenWhenPatientDetailsAccessedByProvider() throws Exception {
        mockMvc.perform(get("/appointments/patient/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldGetProviderAppointmentDetailsSuccessfully() throws Exception {
        AppointmentResponse response = new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null
        );
        when(appointmentService.getProviderAppointmentDetails(any(), eq(1L))).thenReturn(response);

        mockMvc.perform(get("/appointments/provider/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenProviderDetailsAccessedByPatient() throws Exception {
        mockMvc.perform(get("/appointments/provider/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldGetUpcomingPatientAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getUpcomingPatientAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/patient/upcoming"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldForbiddenWhenUpcomingPatientAccessedByProvider() throws Exception {
        mockMvc.perform(get("/appointments/patient/upcoming"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldGetPastPatientAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getPastPatientAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/patient/past"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldForbiddenWhenPastPatientAccessedByProvider() throws Exception {
        mockMvc.perform(get("/appointments/patient/past"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldGetUpcomingProviderAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getUpcomingProviderAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/provider/upcoming"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenUpcomingProviderAccessedByPatient() throws Exception {
        mockMvc.perform(get("/appointments/provider/upcoming"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldGetPastProviderAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getPastProviderAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/provider/past"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenPastProviderAccessedByPatient() throws Exception {
        mockMvc.perform(get("/appointments/provider/past"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldGetCancelledProviderAppointmentsSuccessfully() throws Exception {
        when(appointmentService.getCancelledProviderAppointments(any(), any()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/appointments/provider/cancelled"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenCancelledProviderAccessedByPatient() throws Exception {
        mockMvc.perform(get("/appointments/provider/cancelled"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldGetProviderDashboardStatsSuccessfully() throws Exception {
        ProviderDashboardStatsResponse stats = new ProviderDashboardStatsResponse(1L, 2L, 3L);
        when(appointmentService.getProviderDashboardStats(any())).thenReturn(stats);

        mockMvc.perform(get("/appointments/provider/stats"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenStatsAccessedByPatient() throws Exception {
        mockMvc.perform(get("/appointments/provider/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldConfirmAppointmentSuccessfully() throws Exception {
        AppointmentResponse response = new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null
        );
        when(appointmentService.confirmAppointment(any(), eq(1L))).thenReturn(response);

        mockMvc.perform(patch("/appointments/provider/1/confirm")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenConfirmAccessedByPatient() throws Exception {
        mockMvc.perform(patch("/appointments/provider/1/confirm")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldCancelAppointmentByProviderSuccessfully() throws Exception {
        AppointmentCancelRequest request = new AppointmentCancelRequest("Reason", "Message");

        mockMvc.perform(delete("/appointments/provider/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldForbiddenWhenCancelByProviderAccessedByPatient() throws Exception {
        AppointmentCancelRequest request = new AppointmentCancelRequest("Reason", "Message");

        mockMvc.perform(delete("/appointments/provider/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    void shouldCancelAppointmentByPatientSuccessfully() throws Exception {
        mockMvc.perform(delete("/appointments/patient/1")
                        .with(csrf()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "PROVIDER")
    void shouldForbiddenWhenCancelByPatientAccessedByProvider() throws Exception {
        mockMvc.perform(delete("/appointments/patient/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}