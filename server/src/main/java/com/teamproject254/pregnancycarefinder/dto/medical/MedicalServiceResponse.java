package com.teamproject254.pregnancycarefinder.dto.medical;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MedicalServiceResponse {
    private Long id;
    private String name;
    private Integer durationMinutes;
    private BigDecimal price;
    private Long providerId;
}
