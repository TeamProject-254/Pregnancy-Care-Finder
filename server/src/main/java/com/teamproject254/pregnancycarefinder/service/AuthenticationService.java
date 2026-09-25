package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;

public interface AuthenticationService {

    void registerUser(RegisterRequest registerRequest);

    LoginResponse loginUser(LoginRequest loginRequest);
}
