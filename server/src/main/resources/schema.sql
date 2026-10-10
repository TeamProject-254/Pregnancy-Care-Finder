CREATE TABLE IF NOT EXISTS provider_languages (
                                                  provider_id BIGINT NOT NULL,
                                                  language VARCHAR(255) NOT NULL,
    PRIMARY KEY (provider_id, language)
    );

CREATE TABLE IF NOT EXISTS patient_languages (
                                                 patient_id BIGINT NOT NULL,
                                                 language VARCHAR(255) NOT NULL,
    PRIMARY KEY (patient_id, language)
    );