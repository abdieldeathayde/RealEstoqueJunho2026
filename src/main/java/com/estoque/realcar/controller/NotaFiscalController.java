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

    @PostMapping
<<<<<<< HEAD
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

    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscal> buscar(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
=======
    public ResponseEntity<NotaFiscalResponseDTO> criarNotaFiscal(@RequestBody @Valid NotaFiscalRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notaFiscalService.salvar(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotaFiscalResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(notaFiscalService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotaFiscalResponseDTO> atualizar(@PathVariable Long id, @RequestBody @Valid NotaFiscalRequestDTO dto) {
        return ResponseEntity.ok(notaFiscalService.atualizar(id, dto));
>>>>>>> 6a9f286 (adicionando modificacoes)
    }

    @PutMapping("/{id}")
    public ResponseEntity<NotaFiscal> atualizar(@PathVariable Long id, @RequestBody NotaFiscal notaAtualizada) {
        return repository.findById(id)
                .map(notaExistente -> {
                    // 1. Dados Gerais
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

                    // 2. Impostos e Totais
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

                    // 3. Atualização Segura dos Itens (Orphan Removal vai agir aqui)
                    notaExistente.getItens().clear(); // Limpa os antigos usando a própria coleção rastreada
                    if (notaAtualizada.getItens() != null) {
                        notaAtualizada.getItens().forEach(item -> {
                            item.setNotaFiscal(notaExistente); // Vincula o item à nota existente
                            notaExistente.getItens().add(item); // Adiciona na lista rastreada
                        });
                    }

                    NotaFiscal salva = repository.save(notaExistente);
                    return ResponseEntity.ok(salva);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
<<<<<<< HEAD
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
=======
        notaFiscalService.excluir(id);
>>>>>>> 6a9f286 (adicionando modificacoes)
        return ResponseEntity.noContent().build();
    }
}