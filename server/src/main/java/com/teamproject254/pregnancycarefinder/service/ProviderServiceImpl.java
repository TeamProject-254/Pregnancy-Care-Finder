package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.ProviderRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.ProviderMapper;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import java.util.ArrayList;
import java.util.List;
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
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found for email: " + email));
        return providerMapper.toResponse(provider);
    }

    @Override
    public ProviderResponse createOrUpdateProviderProfile(String email,
                                                          ProviderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Provider provider = providerRepository.findByUserEmail(email)
                .orElseGet(()-> {
                    Provider newProvider = new Provider();
                    newProvider.setUser(user);
                    return newProvider;
                });

        providerMapper.updateProviderFromRequest(request, provider);

        if (request.services() != null) {
            if (provider.getServices() == null) {
                provider.setServices(new ArrayList<>());
            } else {
                provider.getServices().clear();
            }

            request.services().forEach(serviceRequest -> {
                MedicalService service = providerMapper.toEntity(serviceRequest);
                service.setProvider(provider);
                provider.getServices().add(service);
            });

        }
        Provider savedProvider = providerRepository.save(provider);
        return providerMapper.toResponse(savedProvider);
    }

    @Override
    @Transactional(readOnly = true)
    public ProviderResponse getPublicProviderById(Long providerId) {
        Provider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with ID: " + providerId));
        return providerMapper.toResponse(provider);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderResponse> searchProviders(String location, String specialization,
                                                  String serviceName, String language) {
        List<Provider> providers = providerRepository.searchProviders(
                cleanFilter(location),
                cleanFilter(specialization),
                cleanFilter(serviceName),
                cleanFilter(language)
        );

        return providers.stream()
                .map(providerMapper::toResponse)
                .toList();
    }

    private String cleanFilter(String filter) {
        return (filter == null || filter.trim().isEmpty()) ? null : filter.trim();
    }
}
