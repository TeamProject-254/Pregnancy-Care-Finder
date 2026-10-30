package com.teamproject254.pregnancycarefinder.repository;

import com.teamproject254.pregnancycarefinder.model.Availability;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface AvailabilityRepository extends JpaRepository<Availability, Long> {

    Page<Availability> findAllByProviderIdAndDateGreaterThanEqual(
            Pageable pageable,
            Long providerId,
            LocalDate date
    );

    Optional<Availability> findByIdAndProviderId(
            Long availabilityId,
            Long providerId
    );

    Page<Availability> findAllByProviderIdAndDate(
            Pageable pageable,
            Long providerId,
            LocalDate date
    );

    boolean existsByProviderIdAndDateAndStartTimeBeforeAndEndTimeAfter(
            Long providerId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    );

    boolean existsByProviderIdAndDateAndStartTimeBeforeAndEndTimeAfterAndIdNot(
            Long providerId,
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime,
            Long availabilityId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Availability a WHERE a.provider.id = :providerId AND a.date = :date AND a.startTime <= :startTime AND a.endTime >= :endTime")
    Optional<Availability> findAndLockSlot(@Param("providerId") Long providerId,
                                           @Param("date") LocalDate date,
                                           @Param("startTime") LocalTime startTime,
                                           @Param("endTime") LocalTime endTime);
}
