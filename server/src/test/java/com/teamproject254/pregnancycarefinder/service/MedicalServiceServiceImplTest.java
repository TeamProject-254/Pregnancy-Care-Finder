package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import com.teamproject254.pregnancycarefinder.mapper.MedicalServiceMapper;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.MedicalServiceRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.service.impl.MedicalServiceServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalServiceServiceImplTest {

    @Mock
    private MedicalServiceRepository serviceRepository;

    @Mock
    private MedicalServiceMapper serviceMapper;

    @Mock
    private ProviderRepository providerRepository;

    @InjectMocks
    private MedicalServiceServiceImpl medicalServiceService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createService_ShouldCreateService_WhenProviderExists() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        MedicalServiceRequest request = mock(MedicalServiceRequest.class);
        MedicalService model = mock(MedicalService.class);
        MedicalServiceResponse expectedResponse = mock(MedicalServiceResponse.class);

        when(serviceMapper.toModel(request)).thenReturn(model);
        when(serviceMapper.toDto(model)).thenReturn(expectedResponse);

        MedicalServiceResponse response = medicalServiceService.createService(request);

        assertNotNull(response);
        assertEquals(expectedResponse, response);

        verify(model).setProvider(provider);
        verify(serviceRepository).save(model);
        verify(serviceMapper).toDto(model);
    }

    @Test
    void createService_ShouldThrowException_WhenUserIsNotProvider() {
        User user = mock(User.class);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PATIENT);
        MedicalServiceRequest request = mock(MedicalServiceRequest.class);
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> medicalServiceService.createService(request)
        );

        assertEquals(
                "Only providers can manage medical services",
                exception.getMessage()
        );

        verify(providerRepository, never()).findByUserEmail(anyString());
        verify(serviceMapper, never()).toModel(any());
        verify(serviceRepository, never()).save(any());
    }

    @Test
    void createService_ShouldThrowException_WhenProviderNotFound() {
        User user = mock(User.class);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");
        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.empty());

        MedicalServiceRequest request = mock(MedicalServiceRequest.class);

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> medicalServiceService.createService(request)
        );

        assertEquals(
                "Can't find provider by email provider@test.com",
                exception.getMessage()
        );

        verify(serviceMapper, never()).toModel(any());
        verify(serviceRepository, never()).save(any());
    }

    @Test
    void updateService_ShouldThrowException_WhenServiceNotFound() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(provider.getId()).thenReturn(1L);
        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Long serviceId = 10L;
        MedicalServiceRequest request = mock(MedicalServiceRequest.class);

        when(serviceRepository.findByIdAndProviderId(serviceId, 1L))
                .thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> medicalServiceService.updateService(serviceId, request)
        );

        assertEquals(
                "Can't find service by id " + serviceId,
                exception.getMessage()
        );

        verify(serviceMapper, never()).updateModel(any(), any());
        verify(serviceRepository, never()).save(any());
    }

    @Test
    void deleteService_ShouldDeleteService_WhenServiceExists() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(provider.getId()).thenReturn(1L);
        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Long serviceId = 10L;
        MedicalService medicalService = mock(MedicalService.class);

        when(serviceRepository.findByIdAndProviderId(serviceId, 1L))
                .thenReturn(Optional.of(medicalService));
        when(medicalService.getId()).thenReturn(serviceId);

        medicalServiceService.deleteService(serviceId);

        verify(serviceRepository).deleteById(serviceId);
    }

    @Test
    void deleteService_ShouldThrowException_WhenServiceNotFound() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(provider.getId()).thenReturn(1L);
        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Long serviceId = 10L;
        when(serviceRepository.findByIdAndProviderId(serviceId, 1L))
                .thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> medicalServiceService.deleteService(serviceId)
        );
        assertEquals(
                "Can't find service by id " + serviceId,
                exception.getMessage()
        );

        verify(serviceRepository, never()).deleteById(any());
    }

    @Test
    void getMyServices_ShouldReturnServices_WhenProviderExists() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(provider.getId()).thenReturn(1L);
        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Pageable pageable = PageRequest.of(0, 10);
        MedicalService medicalService = mock(MedicalService.class);
        MedicalServiceResponse expectedResponse = mock(MedicalServiceResponse.class);

        Page<MedicalService> services = new PageImpl<>(
                List.of(medicalService),
                pageable,
                1
        );

        when(serviceRepository.findAllByProviderId(pageable, 1L))
                .thenReturn(services);
        when(serviceMapper.toDto(medicalService)).thenReturn(expectedResponse);

        Page<MedicalServiceResponse> response =
                medicalServiceService.getMyServices(pageable);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(expectedResponse, response.getContent().getFirst());

        verify(serviceRepository).findAllByProviderId(pageable, 1L);
        verify(serviceMapper).toDto(medicalService);
    }

    @Test
    void getMyServices_ShouldReturnEmptyPage_WhenProviderHasNoServices() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(provider.getId()).thenReturn(1L);
        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Pageable pageable = PageRequest.of(0, 10);

        when(serviceRepository.findAllByProviderId(pageable, 1L))
                .thenReturn(Page.empty(pageable));

        Page<MedicalServiceResponse> response =
                medicalServiceService.getMyServices(pageable);

        assertNotNull(response);
        assertTrue(response.isEmpty());

        verify(serviceRepository).findAllByProviderId(pageable, 1L);
        verify(serviceMapper, never()).toDto(any());
    }
}
