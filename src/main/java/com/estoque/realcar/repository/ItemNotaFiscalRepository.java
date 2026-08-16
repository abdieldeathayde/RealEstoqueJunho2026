// ItemNotaFiscalRepository.java
package com.estoque.realcar.repository;

import com.estoque.realcar.entities.ItemNotaFiscal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ItemNotaFiscalRepository extends JpaRepository<ItemNotaFiscal, Long> {
    List<ItemNotaFiscal> findByNotaFiscalId(Long notaFiscalId);
}