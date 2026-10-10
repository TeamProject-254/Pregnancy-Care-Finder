package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.ProviderMapper;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import java.util.HashSet;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProviderServiceImpl implements ProviderService {

    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;
    private final ProviderMapper providerMapper;

    @Override
    @Transactional(readOnly = true)
    public ProviderResponse getProviderProfile(String email) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return providerMapper.toResponse(provider);
    }

    @Override
    public ProviderResponse createProviderProfile(String email, ProviderCreateRequest request) {
        if (providerRepository.existsByUserEmail(email)) {
            throw new ResourceAlreadyExistsException("Provider profile already exists for this email");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Provider provider = providerMapper.toEntity(request);
        provider.setUser(user);
        provider.setPublished(false);
        if (provider.getLanguages() == null) {
            provider.setLanguages(new HashSet<>());
        }
        Provider savedProvider = providerRepository.save(provider);
        return providerMapper.toResponse(savedProvider);
    }

    @Override
    public ProviderResponse updateProviderProfile(String email, ProviderUpdateRequest request) {
        Provider provider = providerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));

        if (Boolean.TRUE.equals(request.published()) && !isComplete(request)) {
            throw new IllegalArgumentException("All profile fields except the photo are required to publish");
        }

        providerMapper.updateProviderFromRequest(request, provider);
        Provider savedProvider = providerRepository.save(provider);
        return providerMapper.toResponse(savedProvider);
    }

    private boolean isComplete(ProviderUpdateRequest request) {
        return hasText(request.firstName())
                && hasText(request.lastName())
                && hasText(request.professionalRole())
                && request.yearsOfExperience() != null
                && request.yearsOfExperience() >= 0
                && hasText(request.contactPhone())
                && hasText(request.address())
                && hasText(request.specialization())
                && hasText(request.description())
                && request.languages() != null
                && !request.languages().isEmpty();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
