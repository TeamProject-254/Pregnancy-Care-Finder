package com.teamproject254.pregnancycarefinder.dto;

import java.util.Set;


public record PatientResponse(Long id,
                              String location,
                              Set<String> languages,
                              Integer pregnancyWeek,
                              Boolean explicitConsent) {
}
