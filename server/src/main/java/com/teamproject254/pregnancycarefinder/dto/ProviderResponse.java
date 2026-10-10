package com.teamproject254.pregnancycarefinder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProviderResponse(Long id,
                               String firstName,
                               String lastName,
                               String professionalRole,
                               Long yearsOfExperience,
                               String contactPhone,
                               String address,
                               String specialization,
                               String description,
                               Set<String> languages,
                               String photoUrl,
                               boolean published
) {
    public ProviderResponse(Long id, String firstName, String lastName, String professionalRole,
                            Long yearsOfExperience, String contactPhone, String address,
                            String specialization, String description, Set<String> languages,
                            String photoUrl) {
        this(id, firstName, lastName, professionalRole, yearsOfExperience, contactPhone,
                address, specialization, description, languages, photoUrl, false);
    }
}
