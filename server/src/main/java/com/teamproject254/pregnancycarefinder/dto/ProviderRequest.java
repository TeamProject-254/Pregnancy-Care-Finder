package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;

public record ProviderRequest(
                                     @Size(max = 100, message = "Name must not exceed 100 characters")
                                     String name,

                                     String specialization,

                                     String address,

                                     String workingHours,

                                     @Size(max = 2000, message = "Description is too long")
                                     String description,

                                     String contactInfo,

                                     String licenseNumber,

                                     Set<String> languages,

                                     List<@Valid ServiceRequest> services
                                     ){}
