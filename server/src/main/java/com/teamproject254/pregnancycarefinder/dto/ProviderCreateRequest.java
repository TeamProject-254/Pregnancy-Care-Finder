package com.teamproject254.pregnancycarefinder.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProviderCreateRequest(@NotBlank(message = "First name cannot be blank")
                              String firstName,

                                    @NotBlank(message = "Last name cannot be blank")
                              String lastName,

                                    @NotBlank(message = "Professional role cannot be blank")
                              String professionalRole,

                                    @NotNull(message = "Years of experience is required")
                              @PositiveOrZero(message = "Years of experience must be zero or positive")
                              Long yearsOfExperience,

                                    @NotBlank(message = "Contact phone cannot be blank")
                              String contactPhone,

                                    @NotBlank(message = "Address cannot be blank")
                              String address,

                                    @AssertTrue(message = "Information accuracy consent must be confirmed")
                              Boolean accurateInfoConsent
){}
