package com.teamproject254.pregnancycarefinder.mapper;

import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityRequestDto;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import com.teamproject254.pregnancycarefinder.model.Availability;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AvailabilityMapper {
    @Mapping(target = "providerId", source = "provider.id")
    AvailabilityResponseDto toDto(Availability availability);

    Availability toModel(AvailabilityRequestDto requestDto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "provider", ignore = true)
    void update(
            AvailabilityRequestDto requestDto,
            @MappingTarget Availability availability
    );
}
