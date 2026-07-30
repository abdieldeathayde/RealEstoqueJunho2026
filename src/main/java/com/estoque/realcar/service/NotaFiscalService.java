package com.estoque.realcar.service;

import com.estoque.realcar.dto.*;
import com.estoque.realcar.entities.ItemNotaFiscal;
import com.estoque.realcar.entities.NotaFiscal;
import com.estoque.realcar.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;

    /**
     * Busca uma nota fiscal pelo ID interno.
     */
    @Transactional(readOnly = true)
    public NotaFiscalResponseDTO buscarPorId(Long id) {
        NotaFiscal notaFiscal = notaFiscalRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Nota Fiscal não encontrada com o ID: " + id));
        return converterParaResponseDTO(notaFiscal);
    }

    /**
     * Salva uma nova nota fiscal e seus respectivos itens.
     */
    @Transactional
    public NotaFiscalResponseDTO salvar(NotaFiscalRequestDTO dto) {
        NotaFiscal notaFiscal = converterParaEntidade(dto);
        NotaFiscal salva = notaFiscalRepository.save(notaFiscal);
        return converterParaResponseDTO(salva);
    }

    /**
     * Atualiza uma nota fiscal existente (Resolve o problema do Method Not Allowed).
     */
    @Transactional
    public NotaFiscalResponseDTO atualizar(Long id, NotaFiscalRequestDTO dto) {
        // Garante que a nota existe no banco antes de atualizar
        NotaFiscal notaExistente = notaFiscalRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Não é possível atualizar: Nota Fiscal não encontrada com o ID: " + id));

        // Atualiza os dados gerais da nota
        notaExistente.setNumero(dto.getNumero());
        notaExistente.setSerie(dto.getSerie());
        notaExistente.setNaturezaOperacao(dto.getNaturezaOperacao());
        notaExistente.setDataHoraEmissao(LocalDate.parse(String.valueOf(dto.getDataHoraEmissao()))); // Corrigido parêntese
        notaExistente.setRazaoSocial(dto.getRazaoSocial());
        notaExistente.setCnpjCpf(dto.getCnpjCpf());
        notaExistente.setInscricaoEstadual(dto.getInscricaoEstadual());
        notaExistente.setInscricaoEstadualSt(dto.getInscricaoEstadualSt());
        notaExistente.setEndereco(dto.getEndereco());
        notaExistente.setBairro(dto.getBairro());
        notaExistente.setCep(dto.getCep());
        notaExistente.setMunicipio(dto.getMunicipio());
        notaExistente.setUf(dto.getUf());
        notaExistente.setFone(dto.getFone());
        notaExistente.setBaseCalculoIcms(dto.getBaseCalculoIcms()); // Corrigido parêntese
        notaExistente.setValorIcms(dto.getValorIcms()); // Corrigido parêntese
        notaExistente.setBaseCalculoIcmsSt(dto.getBaseCalculoIcmsSt()); // Corrigido parêntese
        notaExistente.setValorIcmsSt(dto.getValorIcmsSt()); // Corrigido parêntese
        notaExistente.setValorFrete(dto.getValorFrete()); // Corrigido parêntese
        notaExistente.setValorSeguro(dto.getValorSeguro()); // Corrigido parêntese
        notaExistente.setDesconto(dto.getDesconto()); // Corrigido parêntese
        notaExistente.setValorIpi(dto.getValorIpi()); // Corrigido parêntese
        notaExistente.setValorTotalProdutos(dto.getValorTotalProdutos()); // Corrigido parêntese
        notaExistente.setValorTotalNota(dto.getValorTotalNota()); // Corrigido parêntese



        // Limpa os itens antigos para evitar duplicidade e adiciona os novos mapeados
        notaExistente.getItens().clear();
        if (dto.getItens() != null) {
            List<ItemNotaFiscal> novosItens = dto.getItens().stream()
                    .map(itemDto -> converterItemParaEntidade(itemDto, notaExistente))
                    .toList();
            notaExistente.getItens().addAll(novosItens);
        }

        NotaFiscal atualizada = notaFiscalRepository.save(notaExistente);
        return converterParaResponseDTO(atualizada);
    }

    /**
     * Remove uma nota fiscal do sistema por ID.
     */
    @Transactional
    public void excluir(Long id) {
        if (!notaFiscalRepository.existsById(id)) {
            throw new NoSuchElementException("Não é possível excluir: Nota Fiscal não encontrada com o ID: " + id);
        }
        notaFiscalRepository.deleteById(id);
    }

    // ==========================================
    // MÉTODOS AUXILIARES DE CONVERSÃO (MAPPERS)
    // ==========================================

    private NotaFiscalResponseDTO converterParaResponseDTO(NotaFiscal entidade) {
        List<ItemNotaResponseDTO> itensDto = entidade.getItens().stream()
                .map(item -> new ItemNotaResponseDTO(
                        item.getCodigo(), item.getDescricao(), item.getNcm(),
                        item.getCst(), item.getCfop(), item.getUnidade(),
                        item.getQuantidade(), item.getValorUnitario(), item.getValorTotal()
                ))
                .collect(Collectors.toList());

        return new NotaFiscalResponseDTO(
                entidade.getId(), entidade.getNumero(), entidade.getSerie(),
                entidade.getNaturezaOperacao(), entidade.getDataHoraEmissao().atStartOfDay(),
                entidade.getRazaoSocial(), entidade.getCnpjCpf(), entidade.getInscricaoEstadual(),
                entidade.getInscricaoEstadualSt(), entidade.getEndereco(), entidade.getBairro(),
                entidade.getCep(), entidade.getMunicipio(), entidade.getUf(), entidade.getFone(),
                entidade.getBaseCalculoIcms(), entidade.getValorIcms(), entidade.getBaseCalculoIcmsSt(),
                entidade.getValorIcmsSt(), entidade.getValorFrete(), entidade.getValorSeguro(),
                entidade.getDesconto(), entidade.getValorIpi(), entidade.getValorTotalProdutos(),
                entidade.getValorTotalNota(), itensDto
        );
    }

    private NotaFiscal converterParaEntidade(NotaFiscalRequestDTO dto) {
        NotaFiscal notaFiscal = new NotaFiscal();
        notaFiscal.setNumero(dto.getNumero());
        notaFiscal.setSerie(dto.getSerie());
        notaFiscal.setNaturezaOperacao(dto.getNaturezaOperacao());
        notaFiscal.setDataHoraEmissao(dto.getDataHoraEmissao() != null ? dto.getDataHoraEmissao().toLocalDate() : null);
        notaFiscal.setRazaoSocial(dto.getRazaoSocial());
        notaFiscal.setCnpjCpf(dto.getCnpjCpf());
        notaFiscal.setInscricaoEstadual(dto.getInscricaoEstadual());
        notaFiscal.setInscricaoEstadualSt(dto.getInscricaoEstadualSt());
        notaFiscal.setEndereco(dto.getEndereco());
        notaFiscal.setBairro(dto.getBairro());
        notaFiscal.setCep(dto.getCep());
        notaFiscal.setMunicipio(dto.getMunicipio());
        notaFiscal.setUf(dto.getUf());
        notaFiscal.setFone(dto.getFone());
        notaFiscal.setBaseCalculoIcms(dto.getBaseCalculoIcms()); // Corrigido parêntese
        notaFiscal.setValorIcms(dto.getValorIcms()); // Corrigido parêntese
        notaFiscal.setBaseCalculoIcmsSt(dto.getBaseCalculoIcmsSt()); // Corrigido parêntese
        notaFiscal.setValorIcmsSt(dto.getValorIcmsSt()); // Corrigido parêntese
        notaFiscal.setValorFrete(dto.getValorFrete()); // Corrigido parêntese
        notaFiscal.setValorSeguro(dto.getValorSeguro()); // Corrigido parêntese
        notaFiscal.setDesconto(dto.getDesconto()); // Corrigido parêntese
        notaFiscal.setValorIpi(dto.getValorIpi()); // Corrigido parêntese
        notaFiscal.setValorTotalProdutos(dto.getValorTotalProdutos()); // Corrigido parêntese
        notaFiscal.setValorTotalNota(dto.getValorTotalNota()); // Corrigido parêntese

        if (dto.getItens() != null) { // Corrigido de dto.itens() para dto.getItens()
            List<ItemNotaFiscal> itens = dto.getItens().stream() // Corrigido tipo de ItemNota para ItemNotaFiscal e método getItens()
                    .map(itemDto -> converterItemParaEntidade(itemDto, notaFiscal))
                    .collect(Collectors.toList());
            notaFiscal.setItens(itens);
        }

        return notaFiscal;
    }

    private ItemNotaFiscal converterItemParaEntidade(ItemNotaRequestDTO itemDto, NotaFiscal notaFiscal) {
        ItemNotaFiscal item = new ItemNotaFiscal(); // Alterado de ItemNota para ItemNotaFiscal
        item.setCodigo(itemDto.getCodigo()); // Corrigido método get
        item.setDescricao(itemDto.getDescricao()); // Corrigido método get
        item.setNcm(itemDto.getNcm()); // Corrigido método get
        item.setCst(itemDto.getCst()); // Corrigido método get
        item.setCfop(itemDto.getCfop()); // Corrigido método get
        item.setUnidade(itemDto.getUnidade()); // Corrigido método get
        item.setQuantidade(itemDto.getQuantidade()); // Corrigido método get
        item.setValorUnitario(itemDto.getValorUnitario()); // Corrigido método get
        item.setValorTotal(itemDto.getValorTotal()); // Corrigido método get
        item.setNotaFiscal(notaFiscal);
        return item;
    }
}