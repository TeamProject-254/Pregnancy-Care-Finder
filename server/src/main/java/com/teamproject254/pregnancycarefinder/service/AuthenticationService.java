package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;

public interface AuthenticationService {

    void registerUser(RegisterRequest registerRequest);
}
