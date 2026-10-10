package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.ProviderMapper;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;

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
    void getProviderProfile_ShouldReturnProfile_WhenProviderExists() {
        String email = "test@provider.com";
        Provider provider = new Provider();
        ProviderResponse expectedResponse = new ProviderResponse(
                1L, "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", "Gynecology",
                "Specialized in high-risk pregnancies.", Set.of("pl"),
                "https://example.com/photo.jpg"
        );

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        when(providerMapper.toResponse(provider)).thenReturn(expectedResponse);

        ProviderResponse actual = providerService.getProviderProfile(email);

        assertNotNull(actual);
        assertEquals(expectedResponse, actual);
        verify(providerRepository).findByUserEmail(email);
    }

    @Test
    void getProviderProfile_ShouldThrowException_WhenProviderNotFound() {
        String email = "notfound@provider.com";
        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> providerService.getProviderProfile(email));
        verify(providerRepository).findByUserEmail(email);
    }

    @Test
    void createProviderProfile_ShouldReturnCreatedProfile_WhenRequestIsValid() {
        String email = "test@provider.com";
        User user = new User();
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", true
        );
        Provider provider = new Provider();
        Provider savedProvider = new Provider();
        ProviderResponse expectedResponse = new ProviderResponse(
                1L, "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", null, null, null, null
        );

        when(providerRepository.existsByUserEmail(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(providerMapper.toEntity(request)).thenReturn(provider);
        when(providerRepository.save(provider)).thenReturn(savedProvider);
        when(providerMapper.toResponse(savedProvider)).thenReturn(expectedResponse);

        ProviderResponse actual = providerService.createProviderProfile(email, request);

        assertNotNull(actual);
        assertEquals(expectedResponse, actual);
        verify(providerRepository).existsByUserEmail(email);
        verify(userRepository).findByEmail(email);
        verify(providerRepository).save(provider);
    }

    @Test
    void createProviderProfile_ShouldThrowException_WhenProfileAlreadyExists() {
        String email = "test@provider.com";
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", true
        );

        when(providerRepository.existsByUserEmail(email)).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () ->
                providerService.createProviderProfile(email, request)
        );
        verify(providerRepository).existsByUserEmail(email);
        verify(providerRepository, never()).save(any());
    }

    @Test
    void createProviderProfile_ShouldThrowException_WhenConsentNotConfirmed() {
        String email = "test@provider.com";
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", false
        );

        when(providerRepository.existsByUserEmail(email)).thenReturn(false);
        assertThrows(IllegalArgumentException.class, () ->
                providerService.createProviderProfile(email, request)
        );
        verify(providerRepository, never()).save(any());
    }

    @Test
    void createProviderProfile_ShouldThrowException_WhenUserNotFound() {
        String email = "notfound@provider.com";
        ProviderCreateRequest request = new ProviderCreateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 5L,
                "123456789", "Warsaw", true
        );

        when(providerRepository.existsByUserEmail(email)).thenReturn(false);
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                providerService.createProviderProfile(email, request)
        );
        verify(providerRepository, never()).save(any());
    }

    @Test
    void updateProviderProfile_ShouldReturnUpdatedProfile_WhenRequestIsValid() {
        String email = "test@provider.com";
        ProviderUpdateRequest request = new ProviderUpdateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 6L,
                "987654321", "Cracow", "Advanced Gynecology",
                "Updated description.", Set.of("pl", "en"), "https://example.com/new.jpg"
        );
        Provider provider = new Provider();
        Provider savedProvider = new Provider();
        ProviderResponse expectedResponse = new ProviderResponse(
                1L, "Sarah", "Jenkins", "Obstetrician-Gynecologist", 6L,
                "987654321", "Cracow", "Advanced Gynecology",
                "Updated description.", Set.of("pl", "en"), "https://example.com/new.jpg"
        );

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.of(provider));
        doNothing().when(providerMapper).updateProviderFromRequest(request, provider);
        when(providerRepository.save(provider)).thenReturn(savedProvider);
        when(providerMapper.toResponse(savedProvider)).thenReturn(expectedResponse);

        ProviderResponse actual = providerService.updateProviderProfile(email, request);

        assertNotNull(actual);
        assertEquals(expectedResponse, actual);
        verify(providerRepository).findByUserEmail(email);
        verify(providerMapper).updateProviderFromRequest(request, provider);
        verify(providerRepository).save(provider);
    }

    @Test
    void updateProviderProfile_ShouldThrowException_WhenProviderNotFound() {
        String email = "notfound@provider.com";
        ProviderUpdateRequest request = new ProviderUpdateRequest(
                "Sarah", "Jenkins", "Obstetrician-Gynecologist", 6L,
                "987654321", "Cracow", "Advanced Gynecology",
                "Updated description.", Set.of("pl", "en"), "https://example.com/new.jpg"
        );

        when(providerRepository.findByUserEmail(email)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                providerService.updateProviderProfile(email, request)
        );
        verify(providerRepository).findByUserEmail(email);
        verify(providerRepository, never()).save(any());
    }
}