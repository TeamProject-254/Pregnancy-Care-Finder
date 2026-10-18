package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityRequestDto;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AvailabilityService {
    AvailabilityResponseDto createAvailability(AvailabilityRequestDto requestDto);

    Page<AvailabilityResponseDto> getMyUpcomingAvailabilities(Pageable pageable);

    Page<AvailabilityResponseDto> getMyAvailableSlotsPerDay(
            Pageable pageable,
            LocalDate date
    );

    AvailabilityResponseDto updateAvailability(Long id, AvailabilityRequestDto requestDto);

    void deleteAvailability(Long id);
}
