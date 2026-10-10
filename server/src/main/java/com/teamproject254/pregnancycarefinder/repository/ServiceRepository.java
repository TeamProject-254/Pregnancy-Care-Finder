package com.teamproject254.pregnancycarefinder.repository;

import com.teamproject254.pregnancycarefinder.model.MedicalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<MedicalService, Long> {

    Page<MedicalService> findAllByProviderId(Pageable pageable, Long providerId);

    Optional<MedicalService> findByIdAndProviderId(Long serviceId, Long providerId);

    Page<MedicalService> findByNameContainingIgnoreCase(Pageable pageable, String name);
}
