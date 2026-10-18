package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityRequestDto;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import com.teamproject254.pregnancycarefinder.service.AvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/availabilities")
@RequiredArgsConstructor
public class AvailabilityController {
    private final AvailabilityService availabilityService;

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public AvailabilityResponseDto createAvailability(@Valid @RequestBody AvailabilityRequestDto requestDto) {
        return availabilityService.createAvailability(requestDto);
    }

    @GetMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<AvailabilityResponseDto> getMyUpcomingAvailabilities(Pageable pageable) {
        return availabilityService.getMyUpcomingAvailabilities(pageable);
    }

    @GetMapping("/date")
    @PreAuthorize("hasRole('PROVIDER')")
    public Page<AvailabilityResponseDto> getMyAvailableSlotsPerDay(Pageable pageable, LocalDate date) {
        return availabilityService.getMyAvailableSlotsPerDay(pageable, date);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public AvailabilityResponseDto updateAvailability(@PathVariable Long id,
                                                      @Valid @RequestBody AvailabilityRequestDto requestDto) {
        return availabilityService.updateAvailability(id, requestDto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public void deleteAvailability(@PathVariable Long id) {
        availabilityService.deleteAvailability(id);
    }
}
