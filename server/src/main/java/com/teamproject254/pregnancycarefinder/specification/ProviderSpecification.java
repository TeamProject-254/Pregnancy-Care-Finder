package com.teamproject254.pregnancycarefinder.specification;

import com.teamproject254.pregnancycarefinder.model.Provider;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;

public class ProviderSpecification {

    public static Specification<Provider> filterByCriteria(
            List<String> specializations,
            String location,
            List<String> services,
            List<String> languages,
            LocalDate availabilityDateFrom,
            LocalDate availabilityDateTo
    )
    {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.isTrue(root.get("published")));

            if (specializations != null && !specializations.isEmpty()) {
                predicates.add(root.get("specialization").in(specializations));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("address")),
                        "%" + location.toLowerCase() + "%"
                ));
            }

            if (services != null && !services.isEmpty()) {
                predicates.add(root.join("services").get("name").in(services));
                if (query != null) {
                    query.distinct(true);
                }
            }

            if (languages != null && !languages.isEmpty()) {
                Predicate languagePredicate = criteriaBuilder.disjunction();
                var languageJoin = root.join("languages");
                for (String l : languages) {
                    languagePredicate = criteriaBuilder.or(languagePredicate, criteriaBuilder.equal(languageJoin, l));
                }
                predicates.add(languagePredicate);
                if (query != null) {
                    query.distinct(true);
                }
            }

            if (availabilityDateFrom != null && availabilityDateTo != null) {
                var availabilityJoin = root.join("availabilities");
                predicates.add(criteriaBuilder.between(
                        availabilityJoin.get("date"),
                        availabilityDateFrom,
                        availabilityDateTo
                ));
                if (query != null) {
                    query.distinct(true);
                }
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
