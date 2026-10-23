package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderDetailResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderSummaryResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;
import com.teamproject254.pregnancycarefinder.service.ProviderService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @GetMapping("/{id}")
    public ProviderDetailResponse getProviderById(@PathVariable Long id) {
        return providerService.getProviderById(id);
    }

    @GetMapping("/search")
    public List<ProviderSummaryResponse> searchProviders(
            @RequestParam(required = false) List<String> specializations,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) List<String> services,
            @RequestParam(required = false) List<String> languages,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availabilityDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate availabilityDateTo
    ) {
        return providerService.searchProviders(
                specializations, location, services, languages, availabilityDateFrom, availabilityDateTo
        );
    }


    @PreAuthorize("hasRole('PROVIDER')")
    @GetMapping("/profile")
    public ProviderResponse  getProviderProfile(Principal principal) {
        String email = principal.getName();
        return providerService.getProviderProfile(email);
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @PostMapping("/profile")
    public ProviderResponse createProviderProfile(Principal principal,
                                                  @Valid @RequestBody
                                                  ProviderCreateRequest request) {
        String email = principal.getName();
        return providerService.createProviderProfile(email, request);
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @PatchMapping("/profile")
    public ProviderResponse updateProviderProfile(Principal principal,
                                                  @Valid @RequestBody
                                                  ProviderUpdateRequest request) {
        String email = principal.getName();
        return providerService.updateProviderProfile(email, request);
    }
}
