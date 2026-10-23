package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.AppointmentCancelRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderDashboardStatsResponse;
import com.teamproject254.pregnancycarefinder.service.AppointmentService;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/appointments")
@RequiredArgsConstructor
@RestController
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping()
    @PreAuthorize("hasRole('PATIENT')")
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse createAppointment(Principal principal, @Valid @RequestBody
                                                 AppointmentCreateRequest request) {
        String email = principal.getName();
        return appointmentService.createAppointment(email, request);
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public Page<AppointmentResponse> getPatientAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getPatientAppointments(email, pageable);
    }

    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<AppointmentResponse> getProviderAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getProviderAppointments(email, pageable);
    }

    @GetMapping("/patient/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public AppointmentResponse getPatientAppointmentDetails(Principal principal, @PathVariable Long id) {
        String email = principal.getName();
        return appointmentService.getPatientAppointmentDetails(email, id);
    }

    @GetMapping("/provider/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public AppointmentResponse getProviderAppointmentDetails(Principal principal, @PathVariable Long id) {
        String email = principal.getName();
        return appointmentService.getProviderAppointmentDetails(email, id);
    }

    @GetMapping("/patient/upcoming")
    @PreAuthorize("hasRole('PATIENT')")
    public Page<AppointmentResponse> getUpcomingPatientAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getUpcomingPatientAppointments(email, pageable);
    }

    @GetMapping("/patient/past")
    @PreAuthorize("hasRole('PATIENT')")
    public Page<AppointmentResponse> getPastPatientAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getPastPatientAppointments(email, pageable);
    }

    @GetMapping("/provider/upcoming")
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<AppointmentResponse> getUpcomingProviderAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getUpcomingProviderAppointments(email, pageable);
    }

    @GetMapping("/provider/past")
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<AppointmentResponse> getPastProviderAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getPastProviderAppointments(email, pageable);
    }

    @GetMapping("/provider/cancelled")
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<AppointmentResponse> getCancelledProviderAppointments(Principal principal, Pageable pageable) {
        String email = principal.getName();
        return appointmentService.getCancelledProviderAppointments(email, pageable);
    }

    @GetMapping("/provider/stats")
    @PreAuthorize("hasRole('PROVIDER')")
    public ProviderDashboardStatsResponse getProviderDashboardStats(Principal principal) {
        String email = principal.getName();
        return appointmentService.getProviderDashboardStats(email);
    }

    @PatchMapping("/provider/{id}/confirm")
    @PreAuthorize("hasRole('PROVIDER')")
    public AppointmentResponse confirmAppointmentByProvider(Principal principal, @PathVariable Long id) {
        String email = principal.getName();
        return appointmentService.confirmAppointment(email, id);
    }

    @DeleteMapping("/provider/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public void cancelAppointmentByProvider(Principal principal, @PathVariable Long id, @RequestBody @Valid AppointmentCancelRequest request) {
        String email = principal.getName();
        appointmentService.cancelAppointmentByProvider(email, id, request);
    }

    @DeleteMapping("/patient/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public void cancelAppointmentByPatient(Principal principal, @PathVariable Long id) {
        String email = principal.getName();
        appointmentService.cancelAppointmentByPatient(email, id);
    }
}
