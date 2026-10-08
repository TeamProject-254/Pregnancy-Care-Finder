package com.teamproject254.pregnancycarefinder.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.model.enums.Role;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
public class AuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authenticationService, "frontendUrl", "http://localhost:3000");
    }

    @Test
    void registerUser_ShouldSaveUserAndReturnResponse_WhenEmailIsUnique() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", "Password123!", Role.PATIENT, true);

        User savedUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.PATIENT)
                .build();

        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.password())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(savedUser.getEmail())).thenReturn("mock-jwt-token");

        LoginResponse response = authenticationService.registerUser(registerRequest);

        ArgumentCaptor<User> userArgumentCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository, times(1)).save(userArgumentCaptor.capture());

        User capturedUser = userArgumentCaptor.getValue();
        assertEquals("test@example.com", capturedUser.getEmail());
        assertEquals("encodedPassword", capturedUser.getPassword());
        assertEquals(Role.PATIENT, capturedUser.getRole());

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.token());
        assertEquals(1L, response.userId());
        assertEquals(Role.PATIENT, response.role());
    }

    @Test
    void registerUser_ShouldThrowException_WhenEmailAlreadyExists() {
        RegisterRequest registerRequest = new RegisterRequest("test@example.com", "Password123!", "Password123!", Role.PATIENT, true);

        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

        ResourceAlreadyExistsException exception = assertThrows(ResourceAlreadyExistsException.class,
                ()-> authenticationService.registerUser(registerRequest));

        assertEquals("User with this email already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void registerUser_ShouldThrowException_WhenPasswordsDoNotMatch() {
        RegisterRequest registerRequest = new RegisterRequest(
                "test@example.com",
                "Password123!",
                "DifferentPassword123!",
                Role.PATIENT,
                true
        );

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                authenticationService.registerUser(registerRequest));

        assertEquals("Passwords don't match", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void loginUser_ShouldReturnToken_WhenCredentialsAreValid() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "Password123!", false);
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encodedPassword")
                .role(Role.PATIENT)
                .build();

        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user.getEmail())).thenReturn("mock-jwt-token");

        LoginResponse loginResponse = authenticationService.loginUser(loginRequest);

        assertNotNull(loginResponse);
        assertEquals("mock-jwt-token", loginResponse.token());
        assertEquals(1L, loginResponse.userId());
        assertEquals("test@example.com", loginResponse.email());
        assertEquals(Role.PATIENT, loginResponse.role());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void loginUser_ShouldThrowException_WhenUserNotFoundInDatabase() {
        LoginRequest loginRequest = new LoginRequest("notfound@example.com", "Password123!", false);

        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class,
                () -> authenticationService.loginUser(loginRequest));

        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void loginUser_ShouldThrowException_WhenPasswordIsInvalid() {
        LoginRequest loginRequest = new LoginRequest("test@example.com", "WrongPassword!", false);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class,
                () -> authenticationService.loginUser(loginRequest));

        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(userRepository, never()).findByEmail(anyString());
        verify(jwtService, never()).generateToken(anyString());
    }

    @Test
    void createAndSendToken_ShouldGenerateTokenAndSendEmail() {
        String email = "test@example.com";
        User user = new User();
        user.setEmail(email);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        authenticationService.createAndSendToken(email);

        assertNotNull(user.getResetToken());
        assertNotNull(user.getResetTokenExpiry());

        verify(userRepository, times(1)).save(user);
        ArgumentCaptor<SimpleMailMessage> mailCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender, times(1)).send(mailCaptor.capture());

        SimpleMailMessage sentMessage = mailCaptor.getValue();
        assertEquals(email, sentMessage.getTo()[0]);
        assertTrue(sentMessage.getText().contains("http://localhost:3000/reset-password?token="));
    }

    @Test
    void createAndSendToken_ShouldDoNothing_WhenUserNotFound() {
        String email = "notfound@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        authenticationService.createAndSendToken(email);

        verify(javaMailSender, never()).send(any(SimpleMailMessage.class));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenIsInvalid() {
        String token = "invalid-token";
        String newPassword = "NewPassword123!";

        when(userRepository.findByResetToken(token)).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                authenticationService.resetPassword(token, newPassword));

        assertEquals("Invalid reset token", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_ShouldThrowException_WhenTokenIsExpired() {
        String token = "expired-token";
        String newPassword = "NewPassword123!";
        User user = new User();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().minusMinutes(5));

        when(userRepository.findByResetToken(token)).thenReturn(Optional.of(user));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                authenticationService.resetPassword(token, newPassword));

        assertEquals("Reset token has expired", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_ShouldUpdatePassword_WhenTokenIsValid() {
        String token = "valid-token";
        String newPassword = "NewPassword123!";
        User user = new User();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        when(userRepository.findByResetToken(token)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");

        authenticationService.resetPassword(token, newPassword);

        assertEquals("encodedNewPassword", user.getPassword());
        assertNull(user.getResetToken());
        assertNull(user.getResetTokenExpiry());
        verify(userRepository, times(1)).save(user);
    }
}
