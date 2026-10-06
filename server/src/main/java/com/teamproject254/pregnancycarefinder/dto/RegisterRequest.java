package com.teamproject254.pregnancycarefinder.dto;

import com.teamproject254.pregnancycarefinder.model.enums.Role;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(@NotBlank(message = "Email cannot be blank")
                              @Email(message = "Invalid email format")
                              String email,

                              @NotBlank(message = "Password cannot be blank")
                              @Size(min = 8, message = "Password must be at least 8 characters long")
                              @Pattern(
                                      regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$",
                                      message = "Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character"
                              )
                              String password,

                              @NotBlank(message = "Confirm password cannot be blank")
                              String confirmPassword,

                              @NotNull Role role,

                              @AssertTrue(message = "You must agree to the Terms of Service and Privacy Policy")
                              boolean termsAccepted) {
}
