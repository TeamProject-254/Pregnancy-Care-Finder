package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.AppointmentCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.AppointmentResponse;
import com.teamproject254.pregnancycarefinder.model.Appointment;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "provider", ignore = true)
    @Mapping(target = "medicalService", ignore = true)
    @Mapping(target = "appointmentStatus", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "message", ignore = true)
    Appointment toEntity(AppointmentCreateRequest request);

    @Mapping(target = "patientId", source = "patient.id")
    @Mapping(target = "patientFirstName", source = "patient.firstName")
    @Mapping(target = "patientLastName", source = "patient.lastName")
    @Mapping(target = "patientPregnancyWeek", source = "patient.pregnancyWeek")
    @Mapping(target = "patientPhotoUrl", source = "patient.photoUrl")
    @Mapping(target = "providerId", source = "provider.id")
    @Mapping(target = "providerFirstName", source = "provider.firstName")
    @Mapping(target = "providerLastName", source = "provider.lastName")
    @Mapping(target = "providerSpecialization", source = "provider.specialization")
    @Mapping(target = "providerLocation", source = "provider.address")
    @Mapping(target = "providerPhotoUrl", source = "provider.photoUrl")
    @Mapping(target = "serviceName", source = "medicalService.name")
    @Mapping(target = "durationMinutes", source = "medicalService.durationMinutes")
    @Mapping(target = "price", source = "medicalService.price")
    @Mapping(target = "status", source = "appointment.appointmentStatus")
    AppointmentResponse toResponse(Appointment appointment);
}