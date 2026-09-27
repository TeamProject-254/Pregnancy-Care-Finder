package com.teamproject254.pregnancycarefinder.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    AuthenticationServiceImpl authenticationService;

    @Test
    void registerUser_ShouldSaveUser_WhenEmailIsUnique() {

        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", Role.PATIENT);

        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.password())).thenReturn("encodedPassword");

        authenticationService.registerUser(registerRequest);
        ArgumentCaptor<User> userArgumentCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userArgumentCaptor.capture());

        User capturedUser = userArgumentCaptor.getValue();
        assertEquals("test@example.com", capturedUser.getEmail());
        assertEquals("encodedPassword", capturedUser.getPassword());
        assertEquals(Role.PATIENT, capturedUser.getRole());
    }

    @Test
    void registerUser_ShouldThrowException_WhenEmailAlreadyExist() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", Role.PATIENT);

        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, ()->
                authenticationService.registerUser(registerRequest));

        assertEquals("User with this email already exist", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginUser_ShouldReturnToken_WhenCredentialsAreValid() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");
        User user = User.builder()
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.PATIENT)
                .build();

        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user.getEmail())).thenReturn("mock-jwt-token");

        LoginResponse loginResponse = authenticationService.loginUser(loginRequest);

        assertNotNull(loginResponse);
        assertEquals("mock-jwt-token", loginResponse.token());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void loginUser_ShouldThrownException_WhenUserNotFoundInDatabase() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!");

        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> authenticationService.loginUser(loginRequest));

        verify(authenticationManager, times(1)).authenticate(any());
        verify(jwtService, never()).generateToken(anyString());
    }
}
