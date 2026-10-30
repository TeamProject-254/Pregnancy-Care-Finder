package com.teamproject254.pregnancycarefinder.service.impl;

import com.teamproject254.pregnancycarefinder.dto.AppointmentCancelRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderDashboardStatsResponse;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.AppointmentMapper;
import com.teamproject254.pregnancycarefinder.model.Appointment;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Patient;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.enums.AppointmentStatus;
import com.teamproject254.pregnancycarefinder.repository.AppointmentRepository;
import com.teamproject254.pregnancycarefinder.repository.AvailabilityRepository;
import com.teamproject254.pregnancycarefinder.repository.MedicalServiceRepository;
import com.teamproject254.pregnancycarefinder.repository.PatientRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.service.AppointmentService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final PatientRepository patientRepository;
    private final ProviderRepository providerRepository;
    private final AppointmentRepository appointmentRepository;
    private final AvailabilityRepository availabilityRepository;
    private final MedicalServiceRepository medicalServiceRepository;
    private final AppointmentMapper appointmentMapper;

    @Override
    public AppointmentResponse createAppointment(String patientEmail,
                                                 AppointmentCreateRequest request) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        Provider provider = providerRepository.findById(request.providerId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        MedicalService medicalService = medicalServiceRepository.findById(request.serviceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        LocalDate date = request.appointmentDateTime().toLocalDate();
        LocalTime startTime = request.appointmentDateTime().toLocalTime();
        LocalTime endTime = startTime.plusMinutes(medicalService.getDurationMinutes());

        if (availabilityRepository.findAndLockSlot(request.providerId(), date, startTime, endTime).isEmpty()) {
            throw new IllegalArgumentException("Provider is not available at this time");
        }

        Appointment appointment = appointmentMapper.toEntity(request);
        appointment.setPatient(patient);
        appointment.setProvider(provider);
        appointment.setMedicalService(medicalService);
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);
        Appointment savedAppointment;
        savedAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toResponse(savedAppointment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPatientAppointments(String patientEmail,
                                                            Pageable pageable) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        return appointmentRepository.findByPatientId(patient.getId(), pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getProviderAppointments(String providerEmail,
                                                             Pageable pageable) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        return appointmentRepository.findByProviderId(provider.getId(),pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getPatientAppointmentDetails(String patientEmail,
                                                            Long appointmentId) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Appointment appointment = appointmentRepository.findByIdAndPatientId(appointmentId, patient.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return appointmentMapper.toResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getProviderAppointmentDetails(String providerEmail,
                                                             Long appointmentId) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        Appointment appointment = appointmentRepository.findByIdAndProviderId(appointmentId, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return appointmentMapper.toResponse(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getUpcomingPatientAppointments(String patientEmail,
                                                                    Pageable pageable) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByPatientIdAndAppointmentDateTimeGreaterThanEqualOrderByAppointmentDateTimeAsc(patient.getId(), now, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPastPatientAppointments(String patientEmail,
                                                                Pageable pageable) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByPatientIdAndAppointmentDateTimeLessThanOrderByAppointmentDateTimeDesc(patient.getId(), now, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getUpcomingProviderAppointments(String providerEmail,
                                                                     Pageable pageable) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByProviderIdAndAppointmentDateTimeGreaterThanEqualOrderByAppointmentDateTimeAsc(provider.getId(), now, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getPastProviderAppointments(String providerEmail,
                                                                 Pageable pageable) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        LocalDateTime now = LocalDateTime.now();
        return appointmentRepository.findByProviderIdAndAppointmentDateTimeLessThanOrderByAppointmentDateTimeDesc(provider.getId(), now, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getCancelledProviderAppointments(String providerEmail,
                                                                      Pageable pageable) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        List<AppointmentStatus> cancelledStatuses = List.of(
                AppointmentStatus.CANCELLED_BY_PROVIDER,
                AppointmentStatus.CANCELLED_BY_PATIENT
        );
        return appointmentRepository.findByProviderIdAndAppointmentStatusIn(provider.getId(), cancelledStatuses, pageable)
                .map(appointmentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProviderDashboardStatsResponse getProviderDashboardStats(String providerEmail) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        long pendingCount = appointmentRepository.countByProviderIdAndAppointmentStatus(provider.getId(), AppointmentStatus.PENDING);

        long confirmedCount = appointmentRepository.countByProviderIdAndAppointmentStatus(provider.getId(), AppointmentStatus.CONFIRMED);

        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);

        long todayCount = appointmentRepository.countByProviderIdAndAppointmentDateTimeBetween(provider.getId(), start, end);
        return new ProviderDashboardStatsResponse(pendingCount, confirmedCount, todayCount);
    }


    @Override
    public AppointmentResponse confirmAppointment(String providerEmail, Long appointmentId) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        Appointment appointment = appointmentRepository.findByIdAndProviderId(appointmentId, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if(appointment.getAppointmentStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only pending appointments can be confirmed");
        }
        appointment.setAppointmentStatus(AppointmentStatus.CONFIRMED);
        Appointment savedAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toResponse(savedAppointment);
    }

    @Override
    public void cancelAppointmentByProvider(String providerEmail, Long appointmentId,
                                                           AppointmentCancelRequest request) {
        Provider provider = providerRepository.findByUserEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        Appointment appointment = appointmentRepository.findByIdAndProviderId(appointmentId, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED_BY_PROVIDER);
        appointment.setCancellationReason(request.cancellationReason());
        appointmentRepository.save(appointment);
    }

    @Override
    public void cancelAppointmentByPatient(String patientEmail, Long appointmentId) {
        Patient patient = patientRepository.findByUserEmail(patientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        Appointment appointment = appointmentRepository.findByIdAndPatientId(appointmentId, patient.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setAppointmentStatus(AppointmentStatus.CANCELLED_BY_PATIENT);
        appointmentRepository.save(appointment);
    }
}
