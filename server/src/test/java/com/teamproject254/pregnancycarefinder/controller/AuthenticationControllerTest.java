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
import jakarta.servlet.http.Cookie;
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
import org.springframework.mock.web.MockHttpServletResponse;

@ExtendWith(MockitoExtension.class)
public class AuthenticationControllerTest {

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private RateLimiterService rateLimiterService;

    @Mock
    Bucket bucket;

    @InjectMocks
    private AuthenticationController authenticationController;

    private MockHttpServletRequest request;
    private MockHttpServletResponse response;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
    }

    @Test
    void registerUser_ShouldCallService() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", Role.PATIENT);
        authenticationController.registerUser(registerRequest);

        verify(authenticationService, times(1)).registerUser(registerRequest);
    }

    @Test
    void loginUser_ShouldReturnSuccessAndSetHttpOnlyCookie() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");

        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(true);
        when(authenticationService.loginUser(any(LoginRequest.class)))
                .thenReturn(new LoginResponse("mock-jwt-token"));

        ResponseEntity<Map<String, String>> responseEntity =
                authenticationController.loginUser(loginRequest, request, response);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals("Logged in successfully.", responseEntity.getBody().get("message"));

        Cookie cookie = response.getCookie("jwt");
        assertNotNull(cookie);
        assertEquals("mock-jwt-token", cookie.getValue());
        assertTrue(cookie.isHttpOnly());
        assertEquals(3600, cookie.getMaxAge());
        assertEquals("/", cookie.getPath());
    }

    @Test
    void loginUser_ShouldThrowException_WhenCredentialsAreInvalid() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");
        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(true);
        when(authenticationService.loginUser(any(LoginRequest.class))).thenThrow(new org.springframework.security.authentication.BadCredentialsException("Invalid email or password."));

        assertThrows(org.springframework.security.authentication.BadCredentialsException.class, () ->
                authenticationController.loginUser(loginRequest, request, response));

        assertNull(response.getCookie("jwt"));
    }

    @Test
    void loginUser_ShouldThrowRateLimitExceededException_WhenLimitExceeded() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");
        when(rateLimiterService.resolveBucket(anyString())).thenReturn(bucket);
        when(bucket.tryConsume(1)).thenReturn(false);

        assertThrows(RateLimitExceededException.class, () -> authenticationController.loginUser(loginRequest, request, response));

        verify(authenticationService, never()).loginUser(any());
    }

    @Test
    void logoutUser_ShouldClearCookieWithMaxAgeZero() {
        ResponseEntity<Map<String, String>> responseEntity = authenticationController.logoutUser(response);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        assertNotNull(responseEntity.getBody());
        assertEquals("Logged out successfully.", responseEntity.getBody().get("message"));

        Cookie cookie = response.getCookie("jwt");
        assertNotNull(cookie);
        assertEquals("", cookie.getValue());
        assertEquals(0, cookie.getMaxAge());
        assertTrue(cookie.isHttpOnly());
    }
}
