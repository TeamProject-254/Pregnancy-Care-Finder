package com.teamproject254.pregnancycarefinder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.model.Availability;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Patient;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.AvailabilityStatus;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.AvailabilityRepository;
import com.teamproject254.pregnancycarefinder.repository.MedicalServiceRepository;
import com.teamproject254.pregnancycarefinder.repository.PatientRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import com.teamproject254.pregnancycarefinder.service.AppointmentService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class AppointmentConcurrencyIntegrationTest {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ProviderRepository providerRepository;

    @Autowired
    private MedicalServiceRepository medicalServiceRepository;

    @Autowired
    private AvailabilityRepository availabilityRepository;

    private Long testProviderId;
    private Long testServiceId;
    private Long testAvailabilityId;
    private LocalDateTime testDate;
    private String patient1Email;
    private String patient2Email;

    @BeforeEach
    void setUp() {
        String uniqueSuffix = UUID.randomUUID().toString();
        String providerEmail = "provider_" + uniqueSuffix + "@test.com";
        patient1Email = "patient1_" + uniqueSuffix + "@test.com";
        patient2Email = "patient2_" + uniqueSuffix + "@test.com";

        User providerUser = new User();
        providerUser.setEmail(providerEmail);
        providerUser.setPassword("password");
        providerUser.setRole(Role.PROVIDER);
        providerUser.setTermsAccepted(true);
        providerUser = userRepository.save(providerUser);

        Provider provider = new Provider();
        provider.setUser(providerUser);
        provider.setFirstName("Anna");
        provider.setLastName("Kowalska");
        provider.setProfessionalRole("Midwife");
        provider.setContactPhone("123456789");
        provider.setAddress("Gdańsk, Główna 1");
        provider.setAccurateInfoConsent(true);
        provider.setYearsOfExperience(1L);
        provider.setPublished(true);

        provider = providerRepository.save(provider);
        testProviderId = provider.getId();

        MedicalService medicalService = new MedicalService();
        medicalService.setName("Medical Service");
        medicalService.setDurationMinutes(30);
        medicalService.setPrice(BigDecimal.valueOf(150.00));
        medicalService.setProvider(provider);
        medicalService = medicalServiceRepository.save(medicalService);
        testServiceId = medicalService.getId();

        testDate = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);

        Availability availability = new Availability();
        availability.setProvider(provider);
        availability.setDate(testDate.toLocalDate());
        availability.setStartTime(testDate.toLocalTime());
        availability.setEndTime(testDate.toLocalTime().plusMinutes(30));
        availability.setStatus(AvailabilityStatus.FREE);
        availability = availabilityRepository.save(availability);
        testAvailabilityId = availability.getId();

        User user1 = new User();
        user1.setEmail(patient1Email);
        user1.setPassword("password");
        user1.setRole(Role.PATIENT);
        user1.setTermsAccepted(true);
        user1 = userRepository.save(user1);
        Patient patient1 = new Patient();
        patient1.setUser(user1);
        patientRepository.save(patient1);

        User user2 = new User();
        user2.setEmail(patient2Email);
        user2.setPassword("password");
        user2.setRole(Role.PATIENT);
        user2.setTermsAccepted(true);
        user2 = userRepository.save(user2);

        Patient patient2 = new Patient();
        patient2.setUser(user2);
        patientRepository.save(patient2);
    }

    @Test
    void shouldPreventDoubleBookingWhenTwoThreadsTryToBookTheSameSlot() throws Exception {
        int numberOfThreads = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);

        AppointmentCreateRequest request = new AppointmentCreateRequest(testProviderId, testServiceId, 1L, testDate);

        Future<Boolean> future1 = executorService.submit(() -> {
            latch.await();
            try {
                appointmentService.createAppointment(patient1Email, request);
                return true;
            } catch (Exception e) {
                return false;
            }
        });

        Future<Boolean> future2 = executorService.submit(() -> {
            latch.await();
            try {
                appointmentService.createAppointment(patient2Email, request);
                return true;
            } catch (Exception e) {
                return false;
            }
        });

        latch.countDown();

        boolean result1 = future1.get();
        boolean result2 = future2.get();

        executorService.shutdown();

        assertTrue((result1 && !result2) || (!result1 && result2),
                "Double booking occurred! Both threads succeeded or both failed.");

        Availability updatedSlot = availabilityRepository.findById(testAvailabilityId).orElseThrow();
        assertEquals(AvailabilityStatus.BOOKED, updatedSlot.getStatus());
    }

    @Test
    void shouldThrowExceptionWhenTryingToBookAlreadyBookedSlot() {
        Availability slot = availabilityRepository.findById(testAvailabilityId).orElseThrow();
        slot.setStatus(AvailabilityStatus.BOOKED);
        availabilityRepository.saveAndFlush(slot);

        AppointmentCreateRequest request = new AppointmentCreateRequest(testProviderId, testServiceId, 1L, testDate);

        assertThrows(IllegalStateException.class,
                () -> appointmentService.createAppointment(patient1Email, request));

        Availability updatedSlot = availabilityRepository.findById(testAvailabilityId).orElseThrow();
        assertEquals(AvailabilityStatus.BOOKED, updatedSlot.getStatus());
    }
}