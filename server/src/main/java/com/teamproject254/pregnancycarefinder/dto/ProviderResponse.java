package com.teamproject254.pregnancycarefinder.dto;

import java.util.List;
import java.util.Set;

public record ProviderResponse(Long id,
                               String name,
                               String specialization,
                               String address,
                               String workingHours,
                               String description,
                               String contactInfo,
                               String licenseNumber,
                               Set<String> languages,
                               List<ServiceResponse> services
) {}
