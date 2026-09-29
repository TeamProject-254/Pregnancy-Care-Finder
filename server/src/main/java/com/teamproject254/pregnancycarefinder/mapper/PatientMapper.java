package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.PatientRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.model.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    @Mapping(target ="id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Patient toEntity(PatientRequest request);

    PatientResponse toResponse(Patient patient);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    void updatePatientFromRequest(PatientRequest request, @MappingTarget Patient patient);
}
