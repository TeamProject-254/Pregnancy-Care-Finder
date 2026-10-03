package com.teamproject254.pregnancycarefinder.repository;

import com.teamproject254.pregnancycarefinder.model.Provider;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    Optional<Provider> findByUserEmail(String email);

    @Query("SELECT DISTINCT p FROM Provider p " +
            "LEFT JOIN p.services s " +
            "LEFT JOIN p.languages l " +
            "WHERE (:location IS NULL OR LOWER(p.address) LIKE LOWER(CONCAT('%', :location, '%'))) " +
            "AND (:specialization IS NULL OR LOWER(p.specialization) = LOWER(:specialization)) " +
            "AND (:serviceName IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :serviceName, '%'))) " +
            "AND (:language IS NULL OR LOWER(l) = LOWER(:language))")
    List<Provider> searchProviders(
            @Param("location") String location,
            @Param("specialization") String specialization,
            @Param("serviceName") String serviceName,
            @Param("language") String language
    );
}
