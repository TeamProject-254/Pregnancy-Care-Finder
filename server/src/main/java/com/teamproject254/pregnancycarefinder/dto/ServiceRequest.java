package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record ServiceRequest(@NotBlank(message = "Service name is required")
                             String name,

                             @NotNull(message = "Duration is required")
                             @Positive(message = "Duration must be positive")
                             Integer durationMinutes) {
}
