package com.teamproject254.pregnancycarefinder.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "patients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String location;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "patient_languages",
            joinColumns = @JoinColumn(name = "patient_id")
    )
    @Column(name = "language")
    @Builder.Default
    private Set<String> languages = new HashSet<>();

    @Column(name = "pregnancy_week")
    private Integer pregnancyWeek;

    @Column(name = "explicit_consent", nullable = false)
    private Boolean explicitConsent;
}
