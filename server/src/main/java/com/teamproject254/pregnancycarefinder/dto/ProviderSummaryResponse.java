package com.teamproject254.pregnancycarefinder.dto;

import java.util.Set;

public record ProviderSummaryResponse(
        Long id,
        String firstName,
        String lastName,
        String professionalRole,
        Long yearsOfExperience,
        String address,
        String specialization,
        Set<String> languages,
        String photoUrl,
        boolean published
) {}
