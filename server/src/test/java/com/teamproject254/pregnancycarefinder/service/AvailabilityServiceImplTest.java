package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityRequestDto;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import com.teamproject254.pregnancycarefinder.mapper.AvailabilityMapper;
import com.teamproject254.pregnancycarefinder.model.Availability;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.AvailabilityRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.service.impl.AvailabilityServiceImpl;
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

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AvailabilityServiceImplTest {
    @Mock
    private AvailabilityRepository availabilityRepository;

    @Mock
    private AvailabilityMapper availabilityMapper;

    @Mock
    private ProviderRepository providerRepository;

    @InjectMocks
    private AvailabilityServiceImpl availabilityService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldCreateAvailabilityWhenRequestIsValid() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        AvailabilityRequestDto request = new AvailabilityRequestDto();
        request.setDate(LocalDate.of(2700, 10, 5));
        request.setStartTime(LocalTime.of(9, 0, 0));
        request.setEndTime(LocalTime.of(12, 0, 0));
        Availability model = mock(Availability.class);
        AvailabilityResponseDto expectedResponse = new AvailabilityResponseDto();
        expectedResponse.setId(1L);

        when(availabilityMapper.toModel(request)).thenReturn(model);
        when(availabilityMapper.toDto(model)).thenReturn(expectedResponse);

        AvailabilityResponseDto response = availabilityService.createAvailability(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());

        verify(model).setProvider(provider);
        verify(availabilityRepository).save(model);
        verify(availabilityMapper).toDto(model);
    }

    @Test
    void shouldReturnMyUpcomingAvailabilities() {
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
        Availability availability = mock(Availability.class);
        AvailabilityResponseDto expectedResponse = mock(AvailabilityResponseDto.class);

        Page<Availability> availabilities = new PageImpl<>(
                List.of(availability),
                pageable,
                1
        );

        when(availabilityRepository.findAllByProviderIdAndDateGreaterThanEqual(pageable, 1L, LocalDate.now()))
                .thenReturn(availabilities);

        when(availabilityMapper.toDto(availability)).thenReturn(expectedResponse);

        Page<AvailabilityResponseDto> response = availabilityService.getMyUpcomingAvailabilities(pageable);
        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(expectedResponse, response.getContent().getFirst());

        verify(availabilityRepository).findAllByProviderIdAndDateGreaterThanEqual(pageable, 1L, LocalDate.now());
        verify(availabilityMapper).toDto(availability);
    }

    @Test
    void shouldUpdateAvailabilityWhenRequestIsValid() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");
        when(provider.getId()).thenReturn(1L);

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Long availabilityId = 10L;

        Availability availability = mock(Availability.class);
        AvailabilityRequestDto request = new AvailabilityRequestDto();

        request.setDate(LocalDate.of(2026, 11, 10));
        request.setStartTime(LocalTime.of(10, 0));
        request.setEndTime(LocalTime.of(14, 0));

        AvailabilityResponseDto expectedResponse =
                mock(AvailabilityResponseDto.class);

        when(availabilityRepository.findByIdAndProviderId(
                availabilityId, 1L
        )).thenReturn(Optional.of(availability));

        when(availabilityMapper.toDto(availability))
                .thenReturn(expectedResponse);

        AvailabilityResponseDto response =
                availabilityService.updateAvailability(availabilityId, request);

        assertNotNull(response);
        assertEquals(expectedResponse, response);

        verify(availabilityRepository)
                .findByIdAndProviderId(availabilityId, 1L);

        verify(availabilityMapper).update(request, availability);
        verify(availabilityRepository).save(availability);
        verify(availabilityMapper).toDto(availability);
    }

    @Test
    void shouldDeleteAvailabilityWhenAvailabilityExists() {
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

        Long availabilityId = 10L;
        Availability availability = mock(Availability.class);

        when(availabilityRepository.findByIdAndProviderId(availabilityId, 1L))
                .thenReturn(Optional.of(availability));
        when(availability.getId()).thenReturn(availabilityId);

        availabilityService.deleteAvailability(availabilityId);
        verify(availabilityRepository).deleteById(availabilityId);
    }

    @Test
    void getMyUpcomingAvailabilities_ShouldReturnEmptyPage_WhenProviderHasNoAvailabilities() {
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

        when(availabilityRepository.findAllByProviderIdAndDateGreaterThanEqual(pageable, 1L, LocalDate.now()))
                .thenReturn(Page.empty(pageable));

        Page<AvailabilityResponseDto> response =
                availabilityService.getMyUpcomingAvailabilities(pageable);

        assertNotNull(response);
        assertTrue(response.isEmpty());

        verify(availabilityRepository).findAllByProviderIdAndDateGreaterThanEqual(pageable, 1L, LocalDate.now());
        verify(availabilityMapper, never()).toDto(any());
    }

    @Test
    void shouldReturnMyAvailableSlotsWhenProviderExists() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");
        when(provider.getId()).thenReturn(1L);

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Pageable pageable = PageRequest.of(0, 10);
        LocalDate date = LocalDate.of(2026, 11, 1);

        Availability availability = mock(Availability.class);
        AvailabilityResponseDto expectedResponse =
                mock(AvailabilityResponseDto.class);

        Page<Availability> availabilities = new PageImpl<>(
                List.of(availability),
                pageable,
                1
        );

        when(availabilityRepository.findAllByProviderIdAndDate(
                pageable, 1L, date
        )).thenReturn(availabilities);

        when(availabilityMapper.toDto(availability))
                .thenReturn(expectedResponse);

        Page<AvailabilityResponseDto> response =
                availabilityService.getMyAvailableSlotsPerDay(pageable, date);

        assertNotNull(response);
        assertEquals(1, response.getTotalElements());
        assertEquals(expectedResponse, response.getContent().getFirst());

        verify(providerRepository).findByUserEmail("provider@test.com");
        verify(availabilityRepository)
                .findAllByProviderIdAndDate(pageable, 1L, date);
        verify(availabilityMapper).toDto(availability);
    }

    @Test
    void shouldNotDeleteAvailabilityWhenItBelongsToAnotherProvider() {
        User user = mock(User.class);
        Provider provider = mock(Provider.class);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null)
        );

        when(user.getRole()).thenReturn(Role.PROVIDER);
        when(user.getEmail()).thenReturn("provider@test.com");
        when(provider.getId()).thenReturn(1L);

        when(providerRepository.findByUserEmail("provider@test.com"))
                .thenReturn(Optional.of(provider));

        Long availabilityId = 10L;
        when(availabilityRepository.findByIdAndProviderId(availabilityId, 1L))
                .thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> availabilityService.deleteAvailability(availabilityId)
        );

        verify(availabilityRepository)
                .findByIdAndProviderId(availabilityId, 1L);

        verify(availabilityRepository, never())
                .deleteById(anyLong());
    }
}
