package com.estoque.realcar.repository;

import com.estoque.realcar.entities.NotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscal, Long> {

    @Query("SELECT n FROM NotaFiscal n LEFT JOIN FETCH n.itens WHERE n.id = :id")
    Optional<NotaFiscal> findByIdWithItens(@Param("id") Long id);

    @Query("SELECT DISTINCT n FROM NotaFiscal n LEFT JOIN FETCH n.itens")
    List<NotaFiscal> findAllWithItens();

    Optional<NotaFiscal> findByNumero(Integer numero);

    List<NotaFiscal> findByClienteId(Long clienteId);
}