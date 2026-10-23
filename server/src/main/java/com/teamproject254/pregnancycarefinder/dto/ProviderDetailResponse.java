package com.teamproject254.pregnancycarefinder.dto;

import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import java.util.List;
import java.util.Set;

public record ProviderDetailResponse(Long id,
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
                                     boolean published,
                                     List<MedicalServiceResponse> services,
                                     List<AvailabilityResponseDto> availabilities
) {}
