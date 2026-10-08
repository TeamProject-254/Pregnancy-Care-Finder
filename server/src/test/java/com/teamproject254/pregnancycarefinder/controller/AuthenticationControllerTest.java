package com.teamproject254.pregnancycarefinder.controller;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;
import com.teamproject254.pregnancycarefinder.exception.RateLimitExceededException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.security.RateLimiterService;
import com.teamproject254.pregnancycarefinder.service.AuthenticationService;
import io.github.bucket4j.Bucket;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;

@ExtendWith(MockitoExtension.class)
public class AuthenticationControllerTest {

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private RateLimiterService rateLimiterService;

    @Mock
    private Bucket bucket;

    @InjectMocks
    private AuthenticationController authenticationController;

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");
    }

    @Test
    void registerUser_ShouldReturnLoginResponse() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", "Password123!", Role.PATIENT, true);
        LoginResponse mockResponse = new LoginResponse("mock-jwt-token", 1L, "test@example.com", Role.PATIENT);

        when(authenticationService.registerUser(registerRequest)).thenReturn(mockResponse);

        LoginResponse response = authenticationController.registerUser(registerRequest);

        verify(authenticationService, times(1)).registerUser(registerRequest);
        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
    }

    @Test
    void loginUser_ShouldReturnSuccessAndLoginResponse() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!", false);

        LoginResponse mockResponse = new LoginResponse(
                "mock-jwt-token",
                1L,
                "test@example.com",
                Role.PATIENT
        );

        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(true);
        when(authenticationService.loginUser(any(LoginRequest.class))).thenReturn(mockResponse);

        LoginResponse response = authenticationController.loginUser(loginRequest, request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
        assertEquals(1L, response.userId());
        assertEquals("test@example.com", response.email());
        assertEquals(Role.PATIENT, response.role());
    }

    @Test
    void loginUser_ShouldThrowException_WhenCredentialsAreInvalid() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!", false);
        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(true);
        when(authenticationService.loginUser(any(LoginRequest.class))).thenThrow(new BadCredentialsException("Invalid email or password"));

        assertThrows(BadCredentialsException.class, () ->
                authenticationController.loginUser(loginRequest, request));
    }

    @Test
    void loginUser_ShouldThrowRateLimitExceededException_WhenLimitExceeded() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!", false);
        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(false);

        assertThrows(RateLimitExceededException.class, () -> authenticationController.loginUser(loginRequest, request));

        verify(authenticationService, never()).loginUser(any());
    }

    @Test
    void logoutUser_ShouldReturnSuccessMessage() {
        Map<String, String> response = authenticationController.logoutUser();

        assertNotNull(response);
        assertEquals("Logged out successfully", response.get("message"));
    }

    @Test
    void forgotPassword_ShouldCallServiceAndReturnMessage() {
        String email = "test@example.com";

        Map<String, String> response = authenticationController.forgotPassword(email);

        verify(authenticationService, times(1)).createAndSendToken(email);
        assertNotNull(response);
        assertEquals("If an account with this email exists, a reset link has been sent", response.get("message"));
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenIsInvalidOrExpired() {
        String token = "invalid-or-expired-token";
        String newPassword = "NewPassword123!";

        doThrow(new IllegalArgumentException("Invalid reset token"))
                .when(authenticationService).resetPassword(token, newPassword);

        assertThrows(IllegalArgumentException.class, () ->
                authenticationController.resetPassword(token, newPassword));
    }

    @Test
    void resetPassword_ShouldCallServiceAndReturnMessage() {
        String token = "some-reset-token";
        String newPassword = "NewPassword123!";

        Map<String, String> response = authenticationController.resetPassword(token, newPassword);

        verify(authenticationService, times(1)).resetPassword(token, newPassword);
        assertNotNull(response);
        assertEquals("Password has been reset successfully", response.get("message"));
    }
}