
package Acom.teamproject254.pregnancycarefinder.service;

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
import com.teamproject254.pregnancycarefinder.service.impl.AppointmentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceImplTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AvailabilityRepository availabilityRepository;

    @Mock
    private MedicalServiceRepository medicalServiceRepository;

    @Mock
    private AppointmentMapper appointmentMapper;

    @InjectMocks
    private AppointmentServiceImpl appointmentService;

    @Test
    void shouldCreateAppointmentSuccessfully() {
        String email = "patient@test.com";
        AppointmentCreateRequest request = new AppointmentCreateRequest(1L, 1L, 1L, LocalDateTime.now().plusDays(1));
        Patient patient = new Patient();
        Provider provider = new Provider();
        provider.setId(1L);
        MedicalService service = new MedicalService();
        service.setDurationMinutes(30);
        Appointment appointment = new Appointment();
        Appointment savedAppointment = new Appointment();
        AppointmentResponse expectedResponse = new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(providerRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(medicalServiceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(availabilityRepository.existsByProviderIdAndDateAndStartTimeBeforeAndEndTimeAfter(eq(1L), any(), any(), any())).thenReturn(true);
        when(appointmentMapper.toEntity(request)).thenReturn(appointment);
        when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);
        when(appointmentMapper.toResponse(savedAppointment)).thenReturn(expectedResponse);

        AppointmentResponse result = appointmentService.createAppointment(email, request);

        assertNotNull(result);
        verify(appointmentRepository).save(any(Appointment.class));
    }

    @Test
    void shouldThrowExceptionWhenCreatingAppointmentPatientNotFound() {
        String email = "patient@test.com";
        AppointmentCreateRequest request = new AppointmentCreateRequest(1L, 1L, 1L, LocalDateTime.now().plusDays(1));

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.createAppointment(email, request));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void shouldGetPatientAppointmentsSuccessfully() {
        String email = "patient@test.com";
        Pageable pageable = Pageable.unpaged();
        Patient patient = new Patient();
        patient.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByPatientId(1L, pageable)).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getPatientAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetPatientAppointmentsPatientNotFound() {
        String email = "patient@test.com";
        Pageable pageable = Pageable.unpaged();

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getPatientAppointments(email, pageable));
    }

    @Test
    void shouldGetProviderAppointmentsSuccessfully() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();
        Provider provider = new Provider();
        provider.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByProviderId(1L, pageable)).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getProviderAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetProviderAppointmentsProviderNotFound() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getProviderAppointments(email, pageable));
    }

    @Test
    void shouldGetPatientAppointmentDetailsSuccessfully() {
        String email = "patient@test.com";
        Patient patient = new Patient();
        patient.setId(1L);
        Appointment appointment = new Appointment();

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByIdAndPatientId(1L, 1L)).thenReturn(Optional.of(appointment));
        when(appointmentMapper.toResponse(appointment)).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        AppointmentResponse result = appointmentService.getPatientAppointmentDetails(email, 1L);

        assertNotNull(result);
    }

    @Test
    void shouldThrowExceptionWhenGetPatientAppointmentDetailsNotFound() {
        String email = "patient@test.com";
        Patient patient = new Patient();
        patient.setId(1L);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByIdAndPatientId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getPatientAppointmentDetails(email, 1L));
    }

    @Test
    void shouldGetProviderAppointmentDetailsSuccessfully() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);
        Appointment appointment = new Appointment();

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByIdAndProviderId(1L, 1L)).thenReturn(Optional.of(appointment));
        when(appointmentMapper.toResponse(appointment)).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        AppointmentResponse result = appointmentService.getProviderAppointmentDetails(email, 1L);

        assertNotNull(result);
    }

    @Test
    void shouldThrowExceptionWhenGetProviderAppointmentDetailsNotFound() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByIdAndProviderId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getProviderAppointmentDetails(email, 1L));
    }

    @Test
    void shouldGetUpcomingPatientAppointmentsSuccessfully() {
        String email = "patient@test.com";
        Pageable pageable = Pageable.unpaged();
        Patient patient = new Patient();
        patient.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByPatientIdAndAppointmentDateTimeGreaterThanEqualOrderByAppointmentDateTimeAsc(eq(1L), any(), eq(pageable))).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getUpcomingPatientAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetUpcomingPatientAppointmentsPatientNotFound() {
        String email = "patient@test.com";
        Pageable pageable = Pageable.unpaged();

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getUpcomingPatientAppointments(email, pageable));
    }

    @Test
    void shouldGetPastPatientAppointmentsSuccessfully() {
        String email = "patient@test.com";
        Pageable pageable = Pageable.unpaged();
        Patient patient = new Patient();
        patient.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByPatientIdAndAppointmentDateTimeLessThanOrderByAppointmentDateTimeDesc(eq(1L), any(), eq(pageable))).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getPastPatientAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetPastPatientAppointmentsPatientNotFound() {
        String email = "patient@test.com";
        Pageable pageable = Pageable.unpaged();

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getPastPatientAppointments(email, pageable));
    }

    @Test
    void shouldGetUpcomingProviderAppointmentsSuccessfully() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();
        Provider provider = new Provider();
        provider.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByProviderIdAndAppointmentDateTimeGreaterThanEqualOrderByAppointmentDateTimeAsc(eq(1L), any(), eq(pageable))).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getUpcomingProviderAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetUpcomingProviderAppointmentsProviderNotFound() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getUpcomingProviderAppointments(email, pageable));
    }

    @Test
    void shouldGetPastProviderAppointmentsSuccessfully() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();
        Provider provider = new Provider();
        provider.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByProviderIdAndAppointmentDateTimeLessThanOrderByAppointmentDateTimeDesc(eq(1L), any(), eq(pageable))).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getPastProviderAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetPastProviderAppointmentsProviderNotFound() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getPastProviderAppointments(email, pageable));
    }

    @Test
    void shouldGetCancelledProviderAppointmentsSuccessfully() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();
        Provider provider = new Provider();
        provider.setId(1L);
        Page<Appointment> page = new PageImpl<>(List.of(new Appointment()));

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByProviderIdAndAppointmentStatusIn(eq(1L), any(), eq(pageable))).thenReturn(page);
        when(appointmentMapper.toResponse(any())).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        Page<AppointmentResponse> result = appointmentService.getCancelledProviderAppointments(email, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void shouldThrowExceptionWhenGetCancelledProviderAppointmentsProviderNotFound() {
        String email = "provider@test.com";
        Pageable pageable = Pageable.unpaged();

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getCancelledProviderAppointments(email, pageable));
    }

    @Test
    void shouldGetProviderDashboardStatsSuccessfully() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.countByProviderIdAndAppointmentStatus(1L, AppointmentStatus.PENDING)).thenReturn(2L);
        when(appointmentRepository.countByProviderIdAndAppointmentStatus(1L, AppointmentStatus.CONFIRMED)).thenReturn(3L);
        when(appointmentRepository.countByProviderIdAndAppointmentDateTimeBetween(eq(1L), any(), any())).thenReturn(1L);

        ProviderDashboardStatsResponse result = appointmentService.getProviderDashboardStats(email);

        assertNotNull(result);
        assertEquals(2L, result.pendingCount());
        assertEquals(3L, result.confirmedCount());
        assertEquals(1L, result.todayCount());
    }

    @Test
    void shouldThrowExceptionWhenGetProviderDashboardStatsProviderNotFound() {
        String email = "provider@test.com";

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.getProviderDashboardStats(email));
    }

    @Test
    void shouldConfirmAppointmentSuccessfully() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);
        Appointment appointment = new Appointment();
        appointment.setAppointmentStatus(AppointmentStatus.PENDING);

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByIdAndProviderId(1L, 1L)).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(appointment)).thenReturn(appointment);
        when(appointmentMapper.toResponse(appointment)).thenReturn(new AppointmentResponse(
                1L, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, 0, null));

        AppointmentResponse result = appointmentService.confirmAppointment(email, 1L);

        assertNotNull(result);
        assertEquals(AppointmentStatus.CONFIRMED, appointment.getAppointmentStatus());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void shouldThrowExceptionWhenConfirmingNonPendingAppointment() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);
        Appointment appointment = new Appointment();
        appointment.setAppointmentStatus(AppointmentStatus.CONFIRMED);

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByIdAndProviderId(1L, 1L)).thenReturn(Optional.of(appointment));

        assertThrows(IllegalStateException.class, () -> appointmentService.confirmAppointment(email, 1L));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void shouldCancelAppointmentByProviderSuccessfully() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);
        Appointment appointment = new Appointment();
        AppointmentCancelRequest request = new AppointmentCancelRequest("Reason");

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByIdAndProviderId(1L, 1L)).thenReturn(Optional.of(appointment));

        appointmentService.cancelAppointmentByProvider(email, 1L, request);

        assertEquals(AppointmentStatus.CANCELLED_BY_PROVIDER, appointment.getAppointmentStatus());
        assertEquals("Reason", appointment.getCancellationReason());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void shouldThrowExceptionWhenCancelAppointmentByProviderNotFound() {
        String email = "provider@test.com";
        Provider provider = new Provider();
        provider.setId(1L);
        AppointmentCancelRequest request = new AppointmentCancelRequest("Reason");

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(appointmentRepository.findByIdAndProviderId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.cancelAppointmentByProvider(email, 1L, request));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    void shouldCancelAppointmentByPatientSuccessfully() {
        String email = "patient@test.com";
        Patient patient = new Patient();
        patient.setId(1L);
        Appointment appointment = new Appointment();

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByIdAndPatientId(1L, 1L)).thenReturn(Optional.of(appointment));

        appointmentService.cancelAppointmentByPatient(email, 1L);

        assertEquals(AppointmentStatus.CANCELLED_BY_PATIENT, appointment.getAppointmentStatus());
        verify(appointmentRepository).save(appointment);
    }

    @Test
    void shouldThrowExceptionWhenCancelAppointmentByPatientNotFound() {
        String email = "patient@test.com";
        Patient patient = new Patient();
        patient.setId(1L);

        when(patientRepository.findByUserEmail(email)).thenReturn(Optional.of(patient));
        when(appointmentRepository.findByIdAndPatientId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> appointmentService.cancelAppointmentByPatient(email, 1L));
        verify(appointmentRepository, never()).save(any());
    }
}