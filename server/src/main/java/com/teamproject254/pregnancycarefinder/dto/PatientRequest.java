package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.Set;

public record PatientRequest(String location,
                             Set<String> languages,

                             @Min(value = 1, message = "Pregnancy week must be at least 1")
                                    @Max(value = 42, message = "Pregnancy week cannot exceed 42")
                                    Integer pregnancyWeek,

                                    Boolean explicitConsent) {
}
