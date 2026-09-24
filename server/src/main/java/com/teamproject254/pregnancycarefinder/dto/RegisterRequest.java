package com.teamproject254.pregnancycarefinder.dto;

import com.teamproject254.pregnancycarefinder.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(@NotBlank @Email String email,
                              @NotBlank @Size(min = 8)
                              @Pattern(
                                      regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$")
                              String password,
                              @NotNull Role role) {
}
