package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MedicalServiceService {
    MedicalServiceResponse createService(MedicalServiceRequest request);

    MedicalServiceResponse updateService(Long serviceId, MedicalServiceRequest request);

    void deleteService(Long serviceId);

    Page<MedicalServiceResponse> getMyServices(Pageable pageable);

    MedicalServiceResponse getServiceById(Long serviceId);

    Page<MedicalServiceResponse> getAllServices(Pageable pageable);

    Page<MedicalServiceResponse> searchServices(
            Pageable pageable,
            String name
    );
}
