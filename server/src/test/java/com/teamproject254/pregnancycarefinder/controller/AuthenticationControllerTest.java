package com.teamproject254.pregnancycarefinder.controller;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;
import com.teamproject254.pregnancycarefinder.exception.RateLimitExceededException;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    void registerUser_ShouldCallService() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", Role.PATIENT);
        authenticationController.registerUser(registerRequest);

        verify(authenticationService, times(1)).registerUser(registerRequest);
    }

    @Test
    void loginUser_ShouldReturnSuccessAndLoginResponse() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");

        LoginResponse loginResponse = new LoginResponse(
                "mock-jwt-token",
                1L,
                "test@example.com",
                Role.PATIENT
                );

        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(true);
        when(authenticationService.loginUser(any(LoginRequest.class)))
                .thenReturn(loginResponse);

        ResponseEntity<LoginResponse> responseEntity =
                authenticationController.loginUser(loginRequest, request);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals("mock-jwt-token", responseEntity.getBody().token());
        assertEquals(1L, responseEntity.getBody().userId());
        assertEquals("test@example.com", responseEntity.getBody().email());
        assertEquals(Role.PATIENT, responseEntity.getBody().role());
    }

    @Test
    void loginUser_ShouldThrowException_WhenCredentialsAreInvalid() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");
        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(true);
        when(authenticationService.loginUser(any(LoginRequest.class))).thenThrow(new BadCredentialsException("Invalid email or password."));

        assertThrows(BadCredentialsException.class, () ->
                authenticationController.loginUser(loginRequest, request));
    }

    @Test
    void loginUser_ShouldThrowRateLimitExceededException_WhenLimitExceeded() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");
        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(false);

        assertThrows(RateLimitExceededException.class, () -> authenticationController.loginUser(loginRequest, request));

        verify(authenticationService, never()).loginUser(any());
    }

    @Test
    void logoutUser_ShouldReturnSuccessMessage() {
        ResponseEntity<Map<String, String>> responseEntity = authenticationController.logoutUser();

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals("Logged out successfully.", responseEntity.getBody().get("message"));
    }
}
