package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.ProviderRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.service.ProviderService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderService providerService;

    @PreAuthorize("hasRole('PROVIDER')")
    @GetMapping("/profile")
    public ProviderResponse  getProviderProfile(Principal principal) {
        String email = principal.getName();
        return providerService.getProviderProfile(email);
    }

    @PreAuthorize("hasRole('PROVIDER')")
    @PatchMapping("/profile")
    public ProviderResponse createOrUpdateProviderProfile(Principal principal,
                                                          @Valid @RequestBody ProviderRequest request) {
        String email = principal.getName();
        return providerService.createOrUpdateProviderProfile(email, request);
    }

    @GetMapping("/{providerId}")
    public ProviderResponse getPublicProviderById(@PathVariable Long providerId) {
        return providerService.getPublicProviderById(providerId);
    }

    @GetMapping("/search")
    public List<ProviderResponse> searchProviders(@RequestParam(required = false) String location,
                                                  @RequestParam(required = false) String specialization,
                                                  @RequestParam(required = false) String serviceName,
                                                  @RequestParam(required = false) String language) {
        return providerService.searchProviders(location, specialization, serviceName, language);
    }
}
