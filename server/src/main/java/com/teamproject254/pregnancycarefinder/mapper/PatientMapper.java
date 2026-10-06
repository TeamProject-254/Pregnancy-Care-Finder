package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.PatientCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.PatientResponse;
import com.teamproject254.pregnancycarefinder.dto.PatientUpdateRequest;
import com.teamproject254.pregnancycarefinder.model.Patient;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface PatientMapper {

    @Mapping(target ="id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Patient toEntity(PatientCreateRequest request);

    PatientResponse toResponse(Patient patient);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePatientFromRequest(PatientUpdateRequest request, @MappingTarget Patient patient);
}
