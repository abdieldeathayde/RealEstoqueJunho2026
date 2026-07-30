package com.estoque.realcar.controller;

import com.estoque.realcar.dto.request.ProdutoRequestDTO;
import com.estoque.realcar.dto.response.ProdutoResponseDTO;
import com.estoque.realcar.service.ExcelImportService;
import com.estoque.realcar.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/produtos")
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final ExcelImportService excelImportService;

    public ProdutoController(ProdutoService produtoService, ExcelImportService excelImportService) {
        this.produtoService = produtoService;
        this.excelImportService = excelImportService;
    }

    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Long id) {
        return produtoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> criar(@Valid @RequestBody ProdutoRequestDTO dto) {
        ProdutoResponseDTO salvo = produtoService.salvar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequestDTO dto) {
        return produtoService.atualizar(id, dto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean deletado = produtoService.deletar(id);
        return deletado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @PostMapping("/importar")
    public ResponseEntity<?> importarDePlanilha(@RequestParam("file") MultipartFile file) {
        try {
            int totalImportado = excelImportService.importarESalvar(file);
            return ResponseEntity.ok(Map.of(
                    "sucesso", true,
                    "totalImportado", totalImportado
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/importar/visualizar")
    public ResponseEntity<?> visualizarImportacao(@RequestParam("file") MultipartFile file) {
        try {
            List<ProdutoRequestDTO> produtos = excelImportService.importarDePlanilha(file);
            return ResponseEntity.ok(Map.of(
                    "total", produtos.size(),
                    "produtos", produtos
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}