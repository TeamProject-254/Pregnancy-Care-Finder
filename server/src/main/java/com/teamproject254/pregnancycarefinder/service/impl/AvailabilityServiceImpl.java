package com.teamproject254.pregnancycarefinder.service.impl;

import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityRequestDto;
import com.teamproject254.pregnancycarefinder.dto.availability.AvailabilityResponseDto;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.mapper.AvailabilityMapper;
import com.teamproject254.pregnancycarefinder.model.Availability;
import com.teamproject254.pregnancycarefinder.model.Provider;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.AvailabilityStatus;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.AvailabilityRepository;
import com.teamproject254.pregnancycarefinder.repository.ProviderRepository;
import com.teamproject254.pregnancycarefinder.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class AvailabilityServiceImpl implements AvailabilityService {
    private final ProviderRepository providerRepository;
    private final AvailabilityRepository availabilityRepository;
    private final AvailabilityMapper availabilityMapper;

    @Override
    public AvailabilityResponseDto createAvailability(AvailabilityRequestDto requestDto) {
        if (!requestDto.getStartTime().isBefore(requestDto.getEndTime())) {
            throw new IllegalArgumentException(
                    "Start time must be before end time"
            );
        }
        Provider provider = getCurrentProvider();
        if (availabilityRepository.existsByProviderIdAndDateAndStartTimeBeforeAndEndTimeAfter(
                provider.getId(), requestDto.getDate(), requestDto.getEndTime(), requestDto.getStartTime()
        )) {
            throw new IllegalArgumentException("Time not availability " + requestDto.getStartTime() + requestDto.getEndTime());
        }

        Availability model = availabilityMapper.toModel(requestDto);
        model.setProvider(provider);
        model.setStatus(AvailabilityStatus.FREE);
        availabilityRepository.save(model);
        return availabilityMapper.toDto(model);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<AvailabilityResponseDto> getMyUpcomingAvailabilities(Pageable pageable) {
        Provider provider = getCurrentProvider();
        return availabilityRepository.findAllByProviderIdAndDateGreaterThanEqual(
                pageable, provider.getId(), LocalDate.now())
                .map(availabilityMapper::toDto);
    }

    @Transactional(readOnly = true)
    @Override
    public Page<AvailabilityResponseDto> getMyAvailableSlotsPerDay(Pageable pageable, LocalDate date) {
        Provider provider = getCurrentProvider();
        return availabilityRepository.findAllByProviderIdAndDate(pageable, provider.getId(), date)
                .map(availabilityMapper::toDto);
    }

    @Override
    public AvailabilityResponseDto updateAvailability(Long id, AvailabilityRequestDto requestDto) {
        Provider provider = getCurrentProvider();
        Availability availability = availabilityRepository.findByIdAndProviderId(id, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Can't find availability by id " + id));

        if (!requestDto.getStartTime().isBefore(requestDto.getEndTime())) {
            throw new IllegalArgumentException(
                    "Start time must be before end time"
            );
        }
        if (availabilityRepository.existsByProviderIdAndDateAndStartTimeBeforeAndEndTimeAfterAndIdNot(
                provider.getId(), requestDto.getDate(), requestDto.getEndTime(), requestDto.getStartTime(), id
        )) {
            throw new IllegalArgumentException("Time not availability " + requestDto.getStartTime() + requestDto.getEndTime());
        }
        availabilityMapper.update(requestDto, availability);
        availabilityRepository.save(availability);
        return availabilityMapper.toDto(availability);
    }

    @Override
    public void deleteAvailability(Long id) {
        Provider provider = getCurrentProvider();
        Availability availability = availabilityRepository.findByIdAndProviderId(id, provider.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Can't find availability by id " + id));
        availabilityRepository.deleteById(availability.getId());
    }

    private User getUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private Provider getCurrentProvider() {
        User user = getUser();

        if (user.getRole() != Role.PROVIDER) {
            throw new IllegalArgumentException(
                    "Only providers can create availability"
            );
        }

        return providerRepository.findByUserEmail(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Can't find provider by email " + user.getEmail()
                ));
    }
}
