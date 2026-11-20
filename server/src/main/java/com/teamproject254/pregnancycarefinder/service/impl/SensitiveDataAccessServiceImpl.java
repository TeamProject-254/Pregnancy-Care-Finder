package com.teamproject254.pregnancycarefinder.service.impl;

import com.teamproject254.pregnancycarefinder.model.SensitiveDataAccessLog;
import com.teamproject254.pregnancycarefinder.repository.SensitiveDataAccessRepository;
import com.teamproject254.pregnancycarefinder.service.SensitiveDataAccessService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.REQUIRES_NEW)
public class SensitiveDataAccessServiceImpl implements SensitiveDataAccessService {

    private final SensitiveDataAccessRepository sensitiveDataAccessRepository;

    @Override
    public void logAccess(String actorEmail, String actorRole, String targetType, Long targetId,
                          String accessedField) {
        SensitiveDataAccessLog log = SensitiveDataAccessLog.builder()
                .actorEmail(actorEmail)
                .actorRole(actorRole)
                .targetType(targetType)
                .targetId(targetId)
                .accessedField(accessedField)
                .accessedAt(LocalDateTime.now())
                .build();

        sensitiveDataAccessRepository.save(log);
    }
}
