package com.estoque.realcar.service;

import com.estoque.realcar.dto.ItemNotaRequestDTO;
import com.estoque.realcar.dto.ItemNotaResponseDTO;
import com.estoque.realcar.dto.NotaFiscalRequestDTO;
import com.estoque.realcar.dto.NotaFiscalResponseDTO;
import com.estoque.realcar.entities.ItemNotaFiscal;
import com.estoque.realcar.entities.NotaFiscal;
import com.estoque.realcar.exception.ResourceNotFoundException;
import com.estoque.realcar.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;

    /**
     * Lista todas as notas fiscais com seus respectivos itens.
     */
    @Transactional(readOnly = true)
    public List<NotaFiscalResponseDTO> listar() {
        return notaFiscalRepository.findAllWithItens()
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    /**
     * Busca uma nota fiscal pelo ID e traz seus itens.
     */
    @Transactional(readOnly = true)
    public NotaFiscalResponseDTO buscarPorId(Long id) {
        NotaFiscal nota = notaFiscalRepository.findByIdWithItens(id)
                .orElseThrow(() -> new NoSuchElementException("Nota Fiscal não encontrada com o ID: " + id));

        return converterParaResponseDTO(nota);
    }

    /**
     * Salva uma nova nota fiscal e seus respectivos itens.
     */
    @Transactional
    public NotaFiscalResponseDTO salvar(NotaFiscalRequestDTO dto) {

        NotaFiscal notaFiscal = converterParaEntidade(dto);

        // Garante o vínculo bidirecional em cada item da lista
        if (notaFiscal.getItens() != null) {
            notaFiscal.getItens().forEach(item -> item.setNotaFiscal(notaFiscal));
        }

        NotaFiscal salva = notaFiscalRepository.save(notaFiscal);

        return converterParaResponseDTO(salva);
    }

    /**
     * Atualiza uma nota fiscal existente e sincroniza seus itens.
     */
    @Transactional
    public NotaFiscalResponseDTO atualizar(Long id, NotaFiscalRequestDTO dto) {

        NotaFiscal notaExistente = notaFiscalRepository.findByIdWithItens(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Não é possível atualizar: Nota Fiscal não encontrada com o ID: " + id
                ));

        // ==============================
        // DADOS GERAIS
        // ==============================

        if (dto.getNumero() != null) notaExistente.setNumero(Integer.valueOf(dto.getNumero()));
        if (dto.getSerie() != null) notaExistente.setSerie(Integer.valueOf(dto.getSerie()));
        notaExistente.setNaturezaOperacao(dto.getNaturezaOperacao());
        notaExistente.setDataHoraEmissao(dto.getDataHoraEmissao());

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

        // ==============================
        // IMPOSTOS E TOTAIS
        // ==============================

        notaExistente.setBaseCalculoIcms(dto.getBaseCalculoIcms());
        notaExistente.setValorIcms(dto.getValorIcms());
        notaExistente.setBaseCalculoIcmsSt(dto.getBaseCalculoIcmsSt());
        notaExistente.setValorIcmsSt(dto.getValorIcmsSt());
        notaExistente.setValorFrete(dto.getValorFrete());
        notaExistente.setValorSeguro(dto.getValorSeguro());
        notaExistente.setDesconto(dto.getDesconto());
        notaExistente.setValorIpi(dto.getValorIpi());
        notaExistente.setValorTotalProdutos(dto.getValorTotalProdutos());
        notaExistente.setValorTotalNota(dto.getValorTotalNota());

        // ==============================
        // ITENS DA NOTA (Sincronização)
        // ==============================

        notaExistente.getItens().clear();

        if (dto.getItens() != null) {
            List<ItemNotaFiscal> novosItens = dto.getItens()
                    .stream()
                    .map(itemDto -> converterItemParaEntidade(itemDto, notaExistente))
                    .toList();

            notaExistente.getItens().addAll(novosItens);
        }

        NotaFiscal atualizada = notaFiscalRepository.save(notaExistente);

        return converterParaResponseDTO(atualizada);
    }

    /**
     * Exclui uma nota fiscal.
     */
    @Transactional
    public void excluir(Long id) {

        if (!notaFiscalRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Não é possível excluir: Nota Fiscal não encontrada com o ID: " + id
            );
        }

        notaFiscalRepository.deleteById(id);
    }

    // ============================================================
    // CONVERSÃO ENTITY -> RESPONSE DTO
    // ============================================================

    private NotaFiscalResponseDTO converterParaResponseDTO(NotaFiscal entidade) {

        List<ItemNotaResponseDTO> itensDto = (entidade.getItens() != null) ?
                entidade.getItens()
                        .stream()
                        .map(this::converterItemParaDTO)
                        .toList() : new ArrayList<>();

        return new NotaFiscalResponseDTO(
                entidade.getId(),
                entidade.getNumero(),
                entidade.getSerie(),
                entidade.getNaturezaOperacao(),
                entidade.getDataHoraEmissao(),
                entidade.getRazaoSocial(),
                entidade.getCnpjCpf(),
                entidade.getInscricaoEstadual(),
                entidade.getInscricaoEstadualSt(),
                entidade.getEndereco(),
                entidade.getBairro(),
                entidade.getCep(),
                entidade.getMunicipio(),
                entidade.getUf(),
                entidade.getFone(),
                entidade.getBaseCalculoIcms(),
                entidade.getValorIcms(),
                entidade.getBaseCalculoIcmsSt(),
                entidade.getValorIcmsSt(),
                entidade.getValorFrete(),
                entidade.getValorSeguro(),
                entidade.getDesconto(),
                entidade.getValorIpi(),
                entidade.getValorTotalProdutos(),
                entidade.getValorTotalNota(),
                itensDto
        );
    }

    private ItemNotaResponseDTO converterItemParaDTO(ItemNotaFiscal item) {
        return new ItemNotaResponseDTO(
                item.getCodigoProduto(), // 1º: codigo (String)
                item.getDescricao(),     // 2º: descricao (String)
                item.getNcmSh(),         // 3º: ncm (String)
                item.getCst(),           // 4º: cst (String)
                item.getCfop(),          // 5º: cfop (String)
                item.getUnidade(),       // 6º: unidade (String)
                item.getQuantidade(),    // 7º: quantidade (BigDecimal)
                item.getValorUnitario(), // 8º: valorUnitario (BigDecimal)
                item.getValorTotal()     // 9º: valorTotal (BigDecimal)
        );
    }

    // ============================================================
    // CONVERSÃO REQUEST DTO -> ENTITY
    // ============================================================

    private NotaFiscal converterParaEntidade(NotaFiscalRequestDTO dto) {

        NotaFiscal notaFiscal = new NotaFiscal();

        if (dto.getNumero() != null) notaFiscal.setNumero(Integer.valueOf(dto.getNumero()));
        if (dto.getSerie() != null) notaFiscal.setSerie(Integer.valueOf(dto.getSerie()));
        notaFiscal.setNaturezaOperacao(dto.getNaturezaOperacao());
        notaFiscal.setDataHoraEmissao(dto.getDataHoraEmissao());

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

        notaFiscal.setBaseCalculoIcms(dto.getBaseCalculoIcms());
        notaFiscal.setValorIcms(dto.getValorIcms());
        notaFiscal.setBaseCalculoIcmsSt(dto.getBaseCalculoIcmsSt());
        notaFiscal.setValorIcmsSt(dto.getValorIcmsSt());
        notaFiscal.setValorFrete(dto.getValorFrete());
        notaFiscal.setValorSeguro(dto.getValorSeguro());
        notaFiscal.setDesconto(dto.getDesconto());
        notaFiscal.setValorIpi(dto.getValorIpi());
        notaFiscal.setValorTotalProdutos(dto.getValorTotalProdutos());
        notaFiscal.setValorTotalNota(dto.getValorTotalNota());

        // ITENS
        if (dto.getItens() != null) {
            List<ItemNotaFiscal> itens = dto.getItens()
                    .stream()
                    .map(itemDto -> converterItemParaEntidade(itemDto, notaFiscal))
                    .toList();

            notaFiscal.setItens(itens);
        }

        return notaFiscal;
    }

    // ============================================================
    // CONVERSÃO ITEM DTO -> ENTITY
    // ============================================================

    private ItemNotaFiscal converterItemParaEntidade(
            ItemNotaRequestDTO itemDto,
            NotaFiscal notaFiscal) {

        ItemNotaFiscal item = new ItemNotaFiscal();

        item.setCodigoProduto(itemDto.getCodigo());
        item.setDescricao(itemDto.getDescricao());

        // Mapeamento tolerante para NCM vindo do JS
        String ncm = itemDto.getNcmSh() != null ? itemDto.getNcmSh() : null;
        item.setNcmSh(ncm);

        item.setCst(itemDto.getCst());
        item.setCfop(itemDto.getCfop());
        item.setUnidade(itemDto.getUnidade());

        if (itemDto.getQuantidade() != null) {
            item.setQuantidade(BigDecimal.valueOf(itemDto.getQuantidade().doubleValue()));
        }

        item.setValorUnitario(itemDto.getValorUnitario());
        item.setValorTotal(itemDto.getValorTotal());

        item.setNotaFiscal(notaFiscal);

        return item;
    }
}