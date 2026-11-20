package com.teamproject254.pregnancycarefinder.repository;

import com.teamproject254.pregnancycarefinder.model.SensitiveDataAccessLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SensitiveDataAccessRepository extends JpaRepository<SensitiveDataAccessLog, Long> {

    Page<SensitiveDataAccessLog> findAllByTargetId(Long targetId, Pageable pageable);

    Page<SensitiveDataAccessLog> findAllByActorEmail(String actorEmail, Pageable pageable);
}
