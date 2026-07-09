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
    @PutMapping("/{id}")
    public ResponseEntity<NotaFiscal> atualizar(@PathVariable Long id, @RequestBody NotaFiscal notaAtualizada) {
        return repository.findById(id)
                .map(notaExistente -> {
                    // Mapeia os dados novos por cima da nota existente
                    notaExistente.setNumero(notaAtualizada.getNumero());
                    notaExistente.setSerie(notaAtualizada.getSerie());
                    notaExistente.setNaturezaOperacao(notaAtualizada.getNaturezaOperacao());
                    notaExistente.setDataHoraEmissao(notaAtualizada.getDataHoraEmissao());
                    notaExistente.setRazaoSocial(notaAtualizada.getRazaoSocial());
                    notaExistente.setCnpjCpf(notaAtualizada.getCnpjCpf());
                    notaExistente.setInscricaoEstadual(notaAtualizada.getInscricaoEstadual());
                    notaExistente.setInscricaoEstadualSt(notaAtualizada.getInscricaoEstadualSt());
                    notaExistente.setEndereco(notaAtualizada.getEndereco());
                    notaExistente.setBairro(notaAtualizada.getBairro());
                    notaExistente.setCep(notaAtualizada.getCep());
                    notaExistente.setMunicipio(notaAtualizada.getMunicipio());
                    notaExistente.setUf(notaAtualizada.getUf());
                    notaExistente.setFone(notaAtualizada.getFone());
                    notaExistente.setBaseCalculoIcms(notaAtualizada.getBaseCalculoIcms());
                    notaExistente.setValorIcms(notaAtualizada.getValorIcms());
                    notaExistente.setBaseCalculoIcmsSt(notaAtualizada.getBaseCalculoIcmsSt());
                    notaExistente.setValorIcmsSt(notaAtualizada.getValorIcmsSt());
                    notaExistente.setValorFrete(notaAtualizada.getValorFrete());
                    notaExistente.setValorSeguro(notaAtualizada.getValorSeguro());
                    notaExistente.setDesconto(notaAtualizada.getDesconto());
                    notaExistente.setValorIpi(notaAtualizada.getValorIpi());
                    notaExistente.setValorTotalProdutos(notaAtualizada.getValorTotalProdutos());
                    notaExistente.setValorTotalNota(notaAtualizada.getValorTotalNota());

                    // Se você configurou cascade para os itens na Entidade,
                    // lembre-se de atualizar a lista de itens aqui também:
                    // notaExistente.setItens(notaAtualizada.getItens());

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