package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.constraints.NotBlank;

public record AppointmentCancelRequest(
        @NotBlank(message = "Cancellation reason is required")
        String cancellationReason,
        String message) {
    public AppointmentCancelRequest(String cancellationReason) {
        this(cancellationReason, null);
    }
}

