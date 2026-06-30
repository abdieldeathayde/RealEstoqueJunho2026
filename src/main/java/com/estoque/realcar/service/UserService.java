package com.estoque.realcar.service;

import com.estoque.realcar.dto.UserDTO;
import com.estoque.realcar.entities.User;
import com.estoque.realcar.mapper.UserMapper;
import com.estoque.realcar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper usuarioMapper;
    private final PasswordEncoder passwordEncoder;

    public void registro(UserDTO userDTO) {
        // Teste manual para isolar o problema do Mapper:
        User user = new User();
        user.setUsername(userDTO.username()); // No Record é userDTO.username()
        user.setPassword( passwordEncoder.encode(userDTO.password()));
        // user.setRole(...) se necessário

        System.out.println("Salvando usuário: " + user.getUsername());
        userRepository.save(user);
    }



}
