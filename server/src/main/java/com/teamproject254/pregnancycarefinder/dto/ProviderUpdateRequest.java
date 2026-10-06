package com.teamproject254.pregnancycarefinder.dto;

import java.util.Set;

public record ProviderUpdateRequest(String firstName,
                                    String lastName,
                                    String professionalRole,
                                    Long yearsOfExperience,
                                    String contactPhone,
                                    String address,
                                    String specialization,
                                    String description,
                                    Set<String> languages,
                                    String photoUrl
) {}
