package com.teamproject254.pregnancycarefinder.dto;

import java.time.LocalDateTime;

public record AppointmentCreateRequest(Long patientId,
                                       Long providerId,
                                       Long serviceId,
                                       LocalDateTime appointmentDateTime
) {}
