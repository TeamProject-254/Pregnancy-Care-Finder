package com.teamproject254.pregnancycarefinder.service;

public interface SensitiveDataAccessService {

    void logAccess(String actorEmail, String actorRole, String targetType, Long targetId, String accessedField);
}
