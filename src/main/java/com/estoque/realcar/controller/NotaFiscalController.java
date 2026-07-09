package com.estoque.realcar.controller;

import com.estoque.realcar.entities.NotaFiscal;
import com.estoque.realcar.repository.NotaFiscalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notas-fiscais")
@CrossOrigin(origins = "*")
public class NotaFiscalController {

    @Autowired
    private NotaFiscalRepository repository;

    @PostMapping
    public ResponseEntity<NotaFiscal> criarNotaFiscal(@RequestBody NotaFiscal notaFiscal) {
        // Regra crucial: Precisamos iterar nos itens e dizer a cada um deles quem é a nota pai
        if (notaFiscal.getItens() != null) {
            notaFiscal.getItens().forEach(item -> item.setNotaFiscal(notaFiscal));
        }
        return ResponseEntity.ok(repository.save(notaFiscal));
    }



    @GetMapping
    public ResponseEntity<List<NotaFiscal>> listar() {
        return ResponseEntity.ok(repository.findAll());
    }

    // ... manter o restante do código igual

    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscal> buscar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // --- ADICIONE ESTE MÉTODO ABAIXO ---
    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<NotaFiscal> atualizar(@PathVariable Long id, @RequestBody NotaFiscal notaAtualizada) {
        return repository.findById(id)
                .map(notaExistente -> {
                    // ... (mantenha todos os sets dos campos normais que já fizemos)

                    // Ajuste crucial para a lista de produtos/itens:
                    notaExistente.getItens().clear(); // Limpa os itens antigos da sessão do Hibernate

                    if (notaAtualizada.getItens() != null) {
                        notaAtualizada.getItens().forEach(item -> {
                            item.setNotaFiscal(notaExistente); // Vincula o item de volta à nota original
                            notaExistente.getItens().add(item);
                        });
                    }

                    NotaFiscal salva = repository.save(notaExistente);
                    return ResponseEntity.ok(salva);
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}