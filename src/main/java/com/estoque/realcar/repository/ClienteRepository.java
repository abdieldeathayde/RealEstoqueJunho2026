package com.estoque.realcar.repository;

import com.estoque.realcar.entities.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByCnpjCpf(String cnpjCpf);

    Optional<Cliente> findByRazaoSocialIgnoreCase(String razaoSocial);
}