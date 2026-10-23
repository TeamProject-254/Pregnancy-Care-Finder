package com.teamproject254.pregnancycarefinder.dto;

public record ProviderDashboardStatsResponse(
        long pendingCount,
        long confirmedCount,
        long todayCount
) {}
