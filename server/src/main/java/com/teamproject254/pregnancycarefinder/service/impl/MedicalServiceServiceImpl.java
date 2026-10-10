package com.teamproject254.pregnancycarefinder.service.impl;

import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import com.teamproject254.pregnancycarefinder.mapper.MedicalServiceMapper;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.MedicalServiceRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.service.MedicalServiceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MedicalServiceServiceImpl implements MedicalServiceService {
    private final MedicalServiceRepository serviceRepository;
    private final MedicalServiceMapper serviceMapper;
    private final ProviderRepository providerRepository;

    @Override
    public MedicalServiceResponse createService(MedicalServiceRequest request) {
        Provider provider = getCurrentProvider();
        MedicalService model = serviceMapper.toModel(request);
        model.setProvider(provider);
        serviceRepository.save(model);
        return serviceMapper.toDto(model);
    }

    @Override
    public MedicalServiceResponse updateService(Long serviceId, MedicalServiceRequest request) {
        Provider provider = getCurrentProvider();
        MedicalService medicalService = serviceRepository.findByIdAndProviderId(serviceId, provider.getId())
                .orElseThrow(() -> new EntityNotFoundException("Can't find service by id " + serviceId));

        serviceMapper.updateModel(request, medicalService);
        serviceRepository.save(medicalService);
        return serviceMapper.toDto(medicalService);
    }

    @Override
    public void deleteService(Long serviceId) {
        Provider provider = getCurrentProvider();
        MedicalService medicalService = serviceRepository.findByIdAndProviderId(serviceId, provider.getId())
                .orElseThrow(() -> new EntityNotFoundException("Can't find service by id " + serviceId));
        serviceRepository.deleteById(medicalService.getId());
    }

    @Override
    public Page<MedicalServiceResponse> getMyServices(Pageable pageable) {
        Provider provider = getCurrentProvider();
        return serviceRepository.findAllByProviderId(pageable, provider.getId())
                .map(serviceMapper::toDto);
    }

    private User getUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Provider getCurrentProvider() {
        User user = getUser();

        if (user.getRole() != Role.PROVIDER) {
            throw new RuntimeException(
                    "Only providers can manage medical services"
            );
        }

        return providerRepository.findByUserEmail(user.getEmail())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Can't find provider by email " + user.getEmail()
                ));
    }
}
