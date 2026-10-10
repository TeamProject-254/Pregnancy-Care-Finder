package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceRequest;
import com.teamproject254.pregnancycarefinder.dto.medical.MedicalServiceResponse;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MedicalServiceMapper {
    MedicalService toModel(MedicalServiceRequest request);

    MedicalServiceResponse toDto(MedicalService medicalService);

    void updateModel(
            MedicalServiceRequest request,
            @MappingTarget MedicalService medicalService
    );
}
