package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.AppointmentCancelRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderDashboardStatsResponse;
import com.teamproject254.pregnancycarefinder.model.Appointment;
import com.teamproject254.pregnancycarefinder.model.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AppointmentService {

    AppointmentResponse createAppointment(String patientEmail, AppointmentCreateRequest request);

    Page<AppointmentResponse> getPatientAppointments(String patientEmail, Pageable pageable);

    Page<AppointmentResponse> getProviderAppointments(String providerEmail, Pageable pageable);

    AppointmentResponse getPatientAppointmentDetails(String patientEmail, Long appointmentId);

    AppointmentResponse getProviderAppointmentDetails(String providerEmail, Long appointmentId);

    Page<AppointmentResponse> getUpcomingPatientAppointments(String patientEmail, Pageable pageable);

    Page<AppointmentResponse> getPastPatientAppointments(String patientEmail, Pageable pageable);

    Page<AppointmentResponse> getUpcomingProviderAppointments(String providerEmail, Pageable pageable);

    Page<AppointmentResponse> getPastProviderAppointments(String providerEmail, Pageable pageable);

    Page<AppointmentResponse> getCancelledProviderAppointments(String providerEmail, Pageable pageable);

    ProviderDashboardStatsResponse getProviderDashboardStats(String providerEmail);

    AppointmentResponse confirmAppointment(String providerEmail, Long appointmentId);

    void cancelAppointmentByProvider(String providerEmail, Long appointmentId, AppointmentCancelRequest request);

    void cancelAppointmentByPatient(String patientEmail, Long appointmentId);
}
