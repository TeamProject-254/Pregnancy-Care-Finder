package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.ProviderRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ServiceRequest;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.MedicalService;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProviderMapper {

    ProviderResponse toResponse(Provider provider);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "services", ignore = true)
    void updateProviderFromRequest(ProviderRequest request, @MappingTarget Provider provider);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "provider", ignore = true)
    MedicalService toEntity(ServiceRequest serviceRequest);
}
