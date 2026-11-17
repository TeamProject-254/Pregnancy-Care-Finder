package com.teamproject254.pregnancycarefinder.controller;

import com.teamproject254.pregnancycarefinder.dto.EventRequest;
import com.teamproject254.pregnancycarefinder.model.Event;
import com.teamproject254.pregnancycarefinder.repository.EventRepository;
import com.teamproject254.pregnancycarefinder.repository.UserRepository;
import jakarta.validation.Valid;
import java.security.Principal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void logEvent(@Valid @RequestBody EventRequest eventRequest, Principal principal) {
        Event event = new Event();

        if (principal != null) {
            String userEmail = principal.getName();
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                event.setUserId(user.getId());
            });
        }

        event.setSessionId(eventRequest.sessionId());
        event.setUserRole(eventRequest.userRole());
        event.setEventType(eventRequest.eventType());
        event.setPage(eventRequest.page());
        event.setDeviceType(eventRequest.deviceType());
        event.setEventPayload(eventRequest.eventPayload());

        eventRepository.save(event);
    }
}
