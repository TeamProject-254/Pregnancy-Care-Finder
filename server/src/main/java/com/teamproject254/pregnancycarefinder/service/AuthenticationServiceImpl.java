package com.teamproject254.pregnancycarefinder.service;

import com.teamproject254.pregnancycarefinder.dto.LoginRequest;
import com.teamproject254.pregnancycarefinder.dto.LoginResponse;
import com.teamproject254.pregnancycarefinder.dto.RegisterRequest;
import com.teamproject254.pregnancycarefinder.exception.ResourceAlreadyExistsException;
import com.teamproject254.pregnancycarefinder.exception.ResourceNotFoundException;
import com.teamproject254.pregnancycarefinder.model.User;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import com.teamproject254.pregnancycarefinder.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public void registerUser(RegisterRequest registerRequest) {
        if(userRepository.existsByEmail(registerRequest.email())) {
            throw new ResourceAlreadyExistsException("User with this email already exist");
        }

        if(!registerRequest.password().equals(registerRequest.confirmPassword())) {
            throw new IllegalArgumentException("Passwords don't match");
        }

        String encodedPassword = passwordEncoder.encode(registerRequest.password());

        User user = User.builder()
                .email(registerRequest.email())
                .password(encodedPassword)
                .role(registerRequest.role())
                .build();

        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse loginUser(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.email(),
                        loginRequest.password()
                )
        );

        var user = userRepository.findByEmail(loginRequest.email())
                .orElseThrow(()-> new ResourceNotFoundException("The user wasn't found"));

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(token,
                user.getId(),
                user.getEmail(),
                user.getRole());
    }
}
