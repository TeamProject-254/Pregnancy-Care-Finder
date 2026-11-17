package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record AppointmentCreateRequest(@NotNull(message = "Patient ID is required")
                                       Long patientId,

                                       @NotNull(message = "Provider ID is required")
                                       Long providerId,

                                       @NotNull(message = "Service ID is required")
                                       Long serviceId,

                                       @NotNull(message = "Appointment date and time is required")
                                       @Future(message = "Appointment date must be in the future")
                                       LocalDateTime appointmentDateTime
) {}
