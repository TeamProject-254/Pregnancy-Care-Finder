package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.ProviderRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import java.util.List;

public interface ProviderService {

    ProviderResponse getProviderProfile(String email);

    ProviderResponse createOrUpdateProviderProfile(String email, ProviderRequest request);

    ProviderResponse getPublicProviderById(Long providerId);

    List<ProviderResponse> searchProviders(String location, String specialization, String serviceName, String language);

}
