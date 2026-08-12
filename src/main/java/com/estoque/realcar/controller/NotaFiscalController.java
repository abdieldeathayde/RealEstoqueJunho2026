package com.estoque.realcar.controller;

import com.estoque.realcar.dto.NotaFiscalRequestDTO;
import com.estoque.realcar.dto.NotaFiscalResponseDTO;
import com.estoque.realcar.service.NotaFiscalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-fiscais")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    /**
     * Cria uma nova nota fiscal.
     */
    @PostMapping
    public ResponseEntity<NotaFiscalResponseDTO> criarNotaFiscal(
            @Valid @RequestBody NotaFiscalRequestDTO dto) {

        NotaFiscalResponseDTO notaSalva = notaFiscalService.salvar(dto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(notaSalva);
    }

    /**
     * Lista todas as notas fiscais.
     */
    @GetMapping
    public ResponseEntity<List<NotaFiscalResponseDTO>> listar() {

        List<NotaFiscalResponseDTO> notas = notaFiscalService.listar();

        return ResponseEntity.ok(notas);
    }

    /**
     * Busca uma nota fiscal pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscalResponseDTO> buscar(
            @PathVariable("id") Long id) {

        NotaFiscalResponseDTO nota = notaFiscalService.buscarPorId(id);
        return ResponseEntity.ok(nota);
    }

    /**
     * Atualiza uma nota fiscal existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<NotaFiscalResponseDTO> atualizar(
            @PathVariable("id") Long id,
            @Valid @RequestBody NotaFiscalRequestDTO dto) {

        NotaFiscalResponseDTO notaAtualizada = notaFiscalService.atualizar(id, dto);
        return ResponseEntity.ok(notaAtualizada);
    }

    /**
     * Exclui uma nota fiscal pelo ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable("id") Long id) {

        notaFiscalService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}