package com.teamproject254.pregnancycarefinder.repository;

import com.teamproject254.pregnancycarefinder.model.Appointment;
import com.teamproject254.pregnancycarefinder.model.enums.AppointmentStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByProviderId(Long providerId, Pageable pageable);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Optional<Appointment> findByIdAndProviderId(Long id, Long providerId);

    Optional<Appointment> findByIdAndPatientId(Long id, Long patientId);

    Page<Appointment> findByPatientIdAndAppointmentDateTimeGreaterThanEqualOrderByAppointmentDateTimeAsc(Long patientId, LocalDateTime now, Pageable pageable);

    Page<Appointment> findByPatientIdAndAppointmentDateTimeLessThanOrderByAppointmentDateTimeDesc(Long patientId, LocalDateTime now, Pageable pageable);

    Page<Appointment> findByProviderIdAndAppointmentDateTimeGreaterThanEqualOrderByAppointmentDateTimeAsc(Long providerId, LocalDateTime now, Pageable pageable);

    Page<Appointment> findByProviderIdAndAppointmentDateTimeLessThanOrderByAppointmentDateTimeDesc(Long providerId, LocalDateTime now, Pageable pageable);

    Page<Appointment> findByProviderIdAndAppointmentStatusIn(Long providerId, List<AppointmentStatus>statuses, Pageable pageable);

    long countByProviderIdAndAppointmentStatus(Long providerId, AppointmentStatus status);

    long countByProviderIdAndAppointmentDateTimeBetween(Long providerId, LocalDateTime start, LocalDateTime end);
}
