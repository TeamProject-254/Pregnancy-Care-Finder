package com.teamproject254.pregnancycarefinder.repository;

import com.teamproject254.pregnancycarefinder.model.MedicalService;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<MedicalService, Long> {

    List<MedicalService> findByProviderId(Long providerId);
}
