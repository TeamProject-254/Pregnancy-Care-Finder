package com.teamproject254.pregnancycarefinder.model;

import com.teamproject254.pregnancycarefinder.model.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "session_id", length = 64, nullable = false)
    private String sessionId;

    @Column(name = "user_role")
    private Role userRole;

    @Column(name = "event_type", length = 64, nullable = false)
    private String eventType;

    @Column(name = "page")
    private String page;

    @Column(name = "device_type")
    private String deviceType;

    @Column(name = "event_payload", columnDefinition = "JSON")
    private String eventPayload;

    @CreationTimestamp
    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt;
}
