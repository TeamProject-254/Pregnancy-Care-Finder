package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.ProviderRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ServiceRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.ProviderMapper;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProviderServiceImplTest {

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProviderMapper providerMapper;

    @InjectMocks
    private ProviderServiceImpl providerService;

    @Test
    void getProviderProfile_shouldReturnResponse_whenProviderExists() {
        String email = "test@provider.com";
        Provider provider = new Provider();
        ProviderResponse expectedResponse = new ProviderResponse(
                1L,
                "Dr. Sarah Jenkins",
                "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw",
                "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.",
                "+48 500 600 700",
                "MED-987654",
                Set.of("English", "Polish"),
                List.of()
        );

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(providerMapper.toResponse(provider)).thenReturn(expectedResponse);

        ProviderResponse actual = providerService.getProviderProfile(email);

        assertNotNull(actual);
        assertEquals(expectedResponse, actual);
        verify(providerRepository).findByUserEmail(email);
    }

    @Test
    void getProviderProfile_shouldThrowException_whenProviderNotFound() {
        String email = "notfound@provider.com";
        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> providerService.getProviderProfile(email));
    }

    @Test
    void createOrUpdateProviderProfile_shouldCreateNewProvider_whenNotExists() {
        String email = "test@provider.com";
        User user = new User();
        user.setEmail(email);

        ServiceRequest serviceReq = new ServiceRequest("Prenatal Consultation", 45);
        ProviderRequest request = new ProviderRequest(
                "Dr. Sarah Jenkins",
                "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw",
                "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.",
                "+48 500 600 700",
                "MED-987654",
                Set.of("English", "Polish"),
                List.of(serviceReq)
        );

        ProviderResponse expectedResponse = new ProviderResponse(
                1L,
                "Dr. Sarah Jenkins",
                "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw",
                "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.",
                "+48 500 600 700",
                "MED-987654",
                Set.of("English", "Polish"),
                List.of()
        );

        MedicalService mappedService = new MedicalService();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());
        when(providerMapper.toEntity(serviceReq)).thenReturn(mappedService);
        when(providerRepository.save(any(Provider.class))).thenAnswer(inv -> inv.getArgument(0));
        when(providerMapper.toResponse(any(Provider.class))).thenReturn(expectedResponse);

        ProviderResponse response = providerService.createOrUpdateProviderProfile(email, request);

        assertNotNull(response);
        verify(userRepository).findByEmail(email);
        verify(providerRepository).save(any(Provider.class));
        verify(providerMapper).updateProviderFromRequest(eq(request), any(Provider.class));
    }

    @Test
    void createOrUpdateProviderProfile_shouldClearOldServices_whenUpdatingExistingProvider() {
        String email = "test@provider.com";
        User user = new User();

        Provider existingProvider = new Provider();
        List<MedicalService> oldServices = new ArrayList<>();
        oldServices.add(new MedicalService());
        existingProvider.setServices(oldServices);

        ServiceRequest newServiceReq = new ServiceRequest("New Ultrasound", 60);
        ProviderRequest request = new ProviderRequest(
                "Dr. Sarah", "Gyn", "Address", "Hours", "Desc", "Contact", "LIC",
                Set.of("English"), List.of(newServiceReq)
        );

        MedicalService mappedService = new MedicalService();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(existingProvider));
        when(providerMapper.toEntity(newServiceReq)).thenReturn(mappedService);
        when(providerRepository.save(any(Provider.class))).thenAnswer(inv -> inv.getArgument(0));
        when(providerMapper.toResponse(any(Provider.class))).thenReturn(mock(ProviderResponse.class));

        providerService.createOrUpdateProviderProfile(email, request);

        assertEquals(1, existingProvider.getServices().size());
        verify(providerRepository).save(existingProvider);
    }

    @Test
    void createOrUpdateProviderProfile_shouldHandleNullServicesInRequest() {
        String email = "test@provider.com";
        User user = new User();
        user.setEmail(email);

        ProviderRequest request = new ProviderRequest(
                "Dr. Sarah", "Gyn", "Address", "Hours", "Desc", "Contact", "LIC",
                Set.of("English"), null
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());
        when(providerRepository.save(any(Provider.class))).thenAnswer(inv -> inv.getArgument(0));

        assertDoesNotThrow(() -> providerService.createOrUpdateProviderProfile(email, request));
        verify(providerRepository).save(any(Provider.class));
    }

    @Test
    void createOrUpdateProviderProfile_shouldThrowException_whenUserNotFound() {
        String email = "notfound@provider.com";
        ProviderRequest request = new ProviderRequest(
                "Dr. Sarah Jenkins",
                "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw",
                "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.",
                "+48 500 600 700",
                "MED-987654",
                Set.of("English"),
                List.of(new ServiceRequest("Checkup", 30))
        );

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                providerService.createOrUpdateProviderProfile(email, request)
        );
        verify(providerRepository, never()).save(any());
    }

    @Test
    void getPublicProviderById_shouldReturnResponse_whenProviderExists() {
        Long providerId = 1L;
        Provider provider = new Provider();
        ProviderResponse expectedResponse = new ProviderResponse(
                1L,
                "Dr. Sarah Jenkins",
                "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw",
                "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.",
                "+48 500 600 700",
                "MED-987654",
                Set.of("English", "Polish"),
                List.of()
        );

        when(providerRepository.findById(providerId)).thenReturn(Optional.of(provider));
        when(providerMapper.toResponse(provider)).thenReturn(expectedResponse);

        ProviderResponse actual = providerService.getPublicProviderById(providerId);

        assertNotNull(actual);
        assertEquals(expectedResponse, actual);
        verify(providerRepository).findById(providerId);
    }

    @Test
    void getPublicProviderById_shouldThrowException_whenProviderNotFound() {
        Long providerId = 42L;
        when(providerRepository.findById(providerId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> providerService.getPublicProviderById(providerId));
        verify(providerRepository).findById(providerId);
    }

    @Test
    void searchProviders_shouldCleanFiltersAndCallRepository() {
        String location = "  Warsaw ";
        String specialization = " ";
        String serviceName = " Ultrasound ";
        String language = null;

        ProviderResponse expectedResponse = new ProviderResponse(
                1L,
                "Dr. Sarah Jenkins",
                "Obstetrics and Gynecology",
                "123 Medical Ave, Warsaw",
                "Mon-Fri 08:00 - 16:00",
                "Specialized in high-risk pregnancies.",
                "+48 500 600 700",
                "MED-987654",
                Set.of("English", "Polish"),
                List.of()
        );

        when(providerRepository.searchProviders(eq("Warsaw"), isNull(), eq("Ultrasound"), isNull()))
                .thenReturn(List.of(new Provider()));
        when(providerMapper.toResponse(any())).thenReturn(expectedResponse);

        List<ProviderResponse> results = providerService.searchProviders(location, specialization, serviceName, language);

        assertNotNull(results);
        assertEquals(1, results.size());
        verify(providerRepository).searchProviders("Warsaw", null, "Ultrasound", null);
    }

    @Test
    void searchProviders_shouldReturnEmptyList_whenNoProvidersMatch() {
        String location = "NonexistentCity";

        when(providerRepository.searchProviders(eq("NonexistentCity"), isNull(), isNull(), isNull()))
                .thenReturn(List.of());

        List<ProviderResponse> results = providerService.searchProviders(location, null, null, null);

        assertNotNull(results);
        assertTrue(results.isEmpty());
        verify(providerRepository).searchProviders("NonexistentCity", null, null, null);
    }

    @Test
    void searchProviders_shouldCleanAllBlankFiltersToNull() {
        when(providerRepository.searchProviders(isNull(), isNull(), isNull(), isNull()))
                .thenReturn(List.of());

        providerService.searchProviders("   ", "   ", "   ", "   ");

        verify(providerRepository).searchProviders(null, null, null, null);
    }
}