package com.teamproject254.pregnancycarefinder.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AppointmentResponse(Long id,
                                  LocalDateTime appointmentDateTime,
                                  String status,
                                  String message,
                                  String cancellationReason,
                                  Long patientId,
                                  String patientFirstName,
                                  String patientLastName,
                                  String patientPregnancyWeek,
                                  String patientPhotoUrl,
                                  Long providerId,
                                  String providerFirstName,
                                  String providerLastName,
                                  String providerSpecialization,
                                  String providerLocation,
                                  String providerPhotoUrl,
                                  String serviceName,
                                  int durationMinutes,
                                  BigDecimal price
) {}
