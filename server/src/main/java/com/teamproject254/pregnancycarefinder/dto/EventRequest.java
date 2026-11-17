package com.teamproject254.pregnancycarefinder.dto;

import com.teamproject254.pregnancycarefinder.model.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EventRequest(
        @NotBlank @Size(max = 64) String sessionId,
        Role userRole,
        @NotBlank @Size(max = 64) String eventType,
        String page,
        String deviceType,
        String eventPayload)
{}
