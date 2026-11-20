package com.teamproject254.pregnancycarefinder.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.teamproject254.pregnancycarefinder.model.SensitiveDataAccessLog;
import com.teamproject254.pregnancycarefinder.repository.SensitiveDataAccessRepository;
import com.teamproject254.pregnancycarefinder.service.impl.SensitiveDataAccessServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SensitiveDataAccessServiceImplTest {

    @Mock
    private SensitiveDataAccessRepository sensitiveDataAccessRepository;

    @InjectMocks
    private SensitiveDataAccessServiceImpl sensitiveDataAccessService;

    @Test
    void shouldSaveSensitiveDataAccessLogWithTimestamp() {
        when(sensitiveDataAccessRepository.save(any(SensitiveDataAccessLog.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        sensitiveDataAccessService.logAccess(
                "provider@test.com",
                "PROVIDER",
                "PATIENT_PROFILE",
                10L,
                "pregnancyWeek"
        );

        ArgumentCaptor<SensitiveDataAccessLog> captor = ArgumentCaptor.forClass(SensitiveDataAccessLog.class);
        verify(sensitiveDataAccessRepository).save(captor.capture());

        SensitiveDataAccessLog savedLog = captor.getValue();
        assertEquals("provider@test.com", savedLog.getActorEmail());
        assertEquals("PROVIDER", savedLog.getActorRole());
        assertEquals("PATIENT_PROFILE", savedLog.getTargetType());
        assertEquals(10L, savedLog.getTargetId());
        assertEquals("pregnancyWeek", savedLog.getAccessedField());
        assertNotNull(savedLog.getAccessedAt());
    }
}
