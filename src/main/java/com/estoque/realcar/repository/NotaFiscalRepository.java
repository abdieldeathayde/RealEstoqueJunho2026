package com.estoque.realcar.repository;

import com.estoque.realcar.entities.NotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, Long> {

    // Caso precise buscar uma nota específica pelo número no futuro
    Optional<NotaFiscal> findByNumero(String numero);
}