package com.estoque.realcar.controller;

import com.estoque.realcar.auth.request.LoginRequest;
import com.estoque.realcar.auth.response.LoginResponse;
import com.estoque.realcar.dto.UserDTO;
import com.estoque.realcar.service.AuthenticationService;
import com.estoque.realcar.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService service;
    private final UserService usuarioService;

    @PostMapping("/register")
    public ResponseEntity<Void> cadastro(@RequestBody UserDTO userDTO) {

        usuarioService.registro(userDTO);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        String token = service.login(
                request.getUsername(),
                request.getPassword()
        );

        return ResponseEntity.ok(new LoginResponse(token));
    }
}