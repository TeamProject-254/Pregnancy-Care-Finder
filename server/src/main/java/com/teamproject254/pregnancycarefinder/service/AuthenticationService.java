package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;

public interface AuthenticationService {

    LoginResponse registerUser(RegisterRequest registerRequest);

    LoginResponse loginUser(LoginRequest loginRequest);

    void createAndSendToken(String email);

    void resetPassword(String token, String newPassword);
}
