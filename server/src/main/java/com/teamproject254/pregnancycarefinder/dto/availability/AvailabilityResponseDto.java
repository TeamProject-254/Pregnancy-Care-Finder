package com.teamproject254.pregnancycarefinder.dto.availability;

import com.teamproject254.pregnancycarefinder.model.enums.AvailabilityStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailabilityResponseDto {
    private Long id;
    private Long providerId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private AvailabilityStatus status;
}
