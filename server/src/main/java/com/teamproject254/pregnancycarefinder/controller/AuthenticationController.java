package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.service.AuthenticationService;
import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;
import com.teamproject254.pregnancycarefinder.exception.RateLimitExceededException;
import com.teamproject254.pregnancycarefinder.security.RateLimiterService;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final RateLimiterService rateLimiterService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        authenticationService.registerUser(registerRequest);
    }
    @PostMapping("/login")
    public  ResponseEntity<Map<String, String>> loginUser(@Valid @RequestBody LoginRequest loginRequest,
                                                          HttpServletRequest httpServletRequest,
                                                          HttpServletResponse httpServletResponse) {

        String clientIp = httpServletRequest.getRemoteAddr();
        Bucket bucket = rateLimiterService.resolveBucket(clientIp);

        if(!bucket.tryConsume(1)) {
            throw new RateLimitExceededException("Too many login attempts. Please try again in 1 minute.");
        }

        LoginResponse loginResponse = authenticationService.loginUser(loginRequest);
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt", loginResponse.token());
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        httpServletResponse.addCookie(cookie);

        Map<String, String> result = new HashMap<>();
        result.put("message", "Logged in successfully.");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logoutUser(HttpServletResponse httpServletResponse) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        httpServletResponse.addCookie(cookie);

        Map<String, String> result = new HashMap<>();
        result.put("message", "Logged out successfully.");
        return ResponseEntity.ok(result);

    }
}
