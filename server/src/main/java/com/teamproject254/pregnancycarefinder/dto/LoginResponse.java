package com.teamproject254.pregnancycarefinder.dto;

import com.teamproject254.pregnancycarefinder.model.enums.Role;

public record LoginResponse(String token,
                            Long userId,
                            String email,
                            Role role
) {}
