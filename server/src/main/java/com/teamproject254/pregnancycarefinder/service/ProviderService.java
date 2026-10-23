package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderDetailResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderSummaryResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;
import java.time.LocalDate;
import java.util.List;

public interface ProviderService {

    ProviderResponse getProviderProfile(String email);

    ProviderDetailResponse getProviderById(Long id);

    List<ProviderSummaryResponse> searchProviders(List<String> specializations,
                                                  String location,
                                                  List<String> services,
                                                  List<String> languages,
                                                  LocalDate availabilityDateFrom,
                                                  LocalDate availabilityDateTo
    );

    ProviderResponse createProviderProfile(String email, ProviderCreateRequest request);

    ProviderResponse updateProviderProfile(String email, ProviderUpdateRequest request);
}
