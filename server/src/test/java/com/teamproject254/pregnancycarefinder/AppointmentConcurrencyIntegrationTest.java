package com.teamproject254.pregnancycarefinder;

import static org.junit.jupiter.api.Assertions.assertTrue;

import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.model.Availability;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Patient;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.AvailabilityRepository;
import com.teamproject254.pregnancycarefinder.repository.MedicalServiceRepository;
import com.teamproject254.pregnancycarefinder.repository.PatientRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import com.teamproject254.pregnancycarefinder.service.AppointmentService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private LocalDateTime testDate;

    @BeforeEach
    void setUp() {
        User providerUser = new User();
        providerUser.setEmail("provider1001@test.com");
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
        availabilityRepository.save(availability);

        User user1 = new User();
        user1.setEmail("patient1001@test.com");
        user1.setPassword("password");
        user1.setRole(Role.PATIENT);
        user1.setTermsAccepted(true);
        user1 = userRepository.save(user1);
        Patient patient1 = new Patient();
        patient1.setUser(user1);
        patientRepository.save(patient1);

        User user2 = new User();
        user2.setEmail("patient1011@test.com");
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
                appointmentService.createAppointment("patient1001@test.com", request);
                return true;
            } catch (Exception e) {
                return false;
            }
        });

        Future<Boolean> future2 = executorService.submit(() -> {
            latch.await();
            try {
                appointmentService.createAppointment("patient1011@test.com", request);
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
    }
}