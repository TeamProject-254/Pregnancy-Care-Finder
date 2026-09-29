package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Set;

public record ProviderRequest(@NotBlank(message = "Name is required")
                                     @Size(max = 100, message = "Name must not exceed 100 characters")
                                     String name,

                              @NotBlank(message = "Specialization is required")
                                     String specialization,

                              @NotBlank(message = "Address is required")
                                     String address,

                              @NotBlank(message = "Working hours are required")
                                     String workingHours,

                              @NotBlank(message = "Description is required")
                                     @Size(max = 2000, message = "Description is too long")
                                     String description,

                              @NotBlank(message = "Contact info is required")
                                     String contactInfo,

                              @NotBlank(message = "License number is required")
                                     String licenseNumber,

                              @NotEmpty(message = "At least one language is required")
                                     Set<String> languages,

                              @NotEmpty(message = "At least one service is required")
                                     List<@Valid ServiceRequest> services
                                     ){}
