package com.teamproject254.pregnancycarefinder.dto.medical;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MedicalServiceRequest {
    @NotBlank
    private String name;

    @NotNull
    @Positive
    private Integer durationMinutes;

    @NotNull
    @PositiveOrZero
    private BigDecimal price;
}
