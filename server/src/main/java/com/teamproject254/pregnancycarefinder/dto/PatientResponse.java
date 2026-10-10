package com.teamproject254.pregnancycarefinder.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record PatientResponse(Long id,
                              String firstName,
                              String lastName,
                              String location,
                              Set<String> languages,
                              Integer pregnancyWeek,
                              Boolean explicitConsent,
                              String photoUrl
) {}
