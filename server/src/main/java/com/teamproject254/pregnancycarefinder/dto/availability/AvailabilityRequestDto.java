package com.teamproject254.pregnancycarefinder.dto.availability;

import jakarta.persistence.Column;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AvailabilityRequestDto {
    @FutureOrPresent
    @Column(nullable = false)
    @NotNull(message = "Date is required")
    private LocalDate date;
    @Column(nullable = false)
    private LocalTime startTime;
    @Column(nullable = false)
    private LocalTime endTime;
}
