package com.estoque.realcar.controller;

import com.estoque.realcar.entities.NotaFiscal;
import com.estoque.realcar.repository.NotaFiscalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notas-fiscais")
@CrossOrigin(origins = "*") // Ajuste conforme a segurança do seu projeto
public class NotaFiscalController {

    @Autowired
    private NotaFiscalRepository repository;

    @PostMapping
    public ResponseEntity<NotaFiscal> criarNotaFiscal(@RequestBody NotaFiscal notaFiscal) {
        // Regra de negócio ou cálculo manual se necessário antes de salvar
        NotaFiscal novaNota = repository.save(notaFiscal);
        return ResponseEntity.ok(novaNota);
    }
}