package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;

public interface ProviderService {

    ProviderResponse getProviderProfile(String email);

    ProviderResponse createProviderProfile(String email, ProviderCreateRequest request);

    ProviderResponse updateProviderProfile(String email, ProviderUpdateRequest request);
}
