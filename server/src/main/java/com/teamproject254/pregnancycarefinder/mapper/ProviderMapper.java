package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.ProviderCreateRequest;
import com.teamproject254.pregnancycarefinder.dto.ProviderResponse;
import com.teamproject254.pregnancycarefinder.dto.ProviderUpdateRequest;
import com.teamproject254.pregnancycarefinder.model.Provider;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ProviderMapper {

    ProviderResponse toResponse(Provider provider);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "availabilities", ignore = true)
    Provider toEntity(ProviderCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "availabilities", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProviderFromRequest(ProviderUpdateRequest request, @MappingTarget Provider provider);
}
