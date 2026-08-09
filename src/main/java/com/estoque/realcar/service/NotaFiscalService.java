package com.estoque.realcar.service;

import com.estoque.realcar.dto.ItemNotaRequestDTO;
import com.estoque.realcar.dto.ItemNotaResponseDTO;
import com.estoque.realcar.dto.NotaFiscalRequestDTO;
import com.estoque.realcar.dto.NotaFiscalResponseDTO;
import com.estoque.realcar.entities.ItemNotaFiscal;
import com.estoque.realcar.entities.NotaFiscal;
import com.estoque.realcar.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;

    /**
     * Lista todas as notas fiscais.
     */
    @Transactional(readOnly = true)
    public List<NotaFiscalResponseDTO> listar() {
        return notaFiscalRepository.findAll()
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    /**
     * Busca uma nota fiscal pelo ID.
     */
    @Transactional(readOnly = true)
    public NotaFiscalResponseDTO buscarPorId(Long id) {

        NotaFiscal notaFiscal = notaFiscalRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Nota Fiscal não encontrada com o ID: " + id
                ));

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
     * Atualiza uma nota fiscal existente.
     */
    @Transactional
    public NotaFiscalResponseDTO atualizar(
            Long id,
            NotaFiscalRequestDTO dto) {

        NotaFiscal notaExistente = notaFiscalRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException(
                        "Não é possível atualizar: Nota Fiscal não encontrada com o ID: " + id
                ));

        // ==============================
        // DADOS GERAIS
        // ==============================

        notaExistente.setNumero(Integer.valueOf(dto.getNumero()));
        notaExistente.setSerie(Integer.valueOf(dto.getSerie()));
        notaExistente.setNaturezaOperacao(dto.getNaturezaOperacao());

        if (dto.getDataHoraEmissao() != null) {
            notaExistente.setDataHoraEmissao(
                    dto.getDataHoraEmissao()
            );
        } else {
            notaExistente.setDataHoraEmissao(null);
        }

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
        // ITENS DA NOTA
        // ==============================

        notaExistente.getItens().clear();

        if (dto.getItens() != null) {

            List<ItemNotaFiscal> novosItens = dto.getItens()
                    .stream()
                    .map(itemDto ->
                            converterItemParaEntidade(
                                    itemDto,
                                    notaExistente
                            )
                    )
                    .toList();

            notaExistente.getItens().addAll(novosItens);
        }

        NotaFiscal atualizada =
                notaFiscalRepository.save(notaExistente);

        return converterParaResponseDTO(atualizada);
    }

    /**
     * Exclui uma nota fiscal.
     */
    @Transactional
    public void excluir(Long id) {

        if (!notaFiscalRepository.existsById(id)) {
            throw new NoSuchElementException(
                    "Não é possível excluir: Nota Fiscal não encontrada com o ID: " + id
            );
        }

        notaFiscalRepository.deleteById(id);
    }

// ============================================================
// CONVERSÃO ENTITY -> RESPONSE DTO
// ============================================================

    private NotaFiscalResponseDTO converterParaResponseDTO(
            NotaFiscal entidade) {

        List<ItemNotaResponseDTO> itensDto =
                entidade.getItens()
                        .stream()
                        .map(item -> new ItemNotaResponseDTO(
                                item.getDescricao(),
                                item.getCodigoProduto(),
                                item.getNcmSh(),
                                item.getCst(),
                                item.getCfop(),
                                item.getUnidade(),
                                item.getQuantidade(),
                                item.getValorUnitario(),
                                item.getValorTotal()
                        ))
                        .toList();

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

// ============================================================
// CONVERSÃO REQUEST DTO -> ENTITY
// ============================================================

    private NotaFiscal converterParaEntidade(
            NotaFiscalRequestDTO dto) {

        NotaFiscal notaFiscal = new NotaFiscal();

        notaFiscal.setNumero(Integer.valueOf(dto.getNumero()));
        notaFiscal.setSerie(Integer.valueOf(dto.getSerie()));
        notaFiscal.setNaturezaOperacao(dto.getNaturezaOperacao());

        if (dto.getDataHoraEmissao() != null) {
            notaFiscal.setDataHoraEmissao(
                    dto.getDataHoraEmissao()
            );
        }

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

        notaFiscal.setBaseCalculoIcms(
                dto.getBaseCalculoIcms()
        );

        notaFiscal.setValorIcms(
                dto.getValorIcms()
        );

        notaFiscal.setBaseCalculoIcmsSt(
                dto.getBaseCalculoIcmsSt()
        );

        notaFiscal.setValorIcmsSt(
                dto.getValorIcmsSt()
        );

        notaFiscal.setValorFrete(
                dto.getValorFrete()
        );

        notaFiscal.setValorSeguro(
                dto.getValorSeguro()
        );

        notaFiscal.setDesconto(
                dto.getDesconto()
        );

        notaFiscal.setValorIpi(
                dto.getValorIpi()
        );

        notaFiscal.setValorTotalProdutos(
                dto.getValorTotalProdutos()
        );

        notaFiscal.setValorTotalNota(
                dto.getValorTotalNota()
        );

        // ==============================
        // ITENS
        // ==============================

        if (dto.getItens() != null) {

            List<ItemNotaFiscal> itens = dto.getItens()
                    .stream()
                    .map(itemDto ->
                            converterItemParaEntidade(
                                    itemDto,
                                    notaFiscal
                            )
                    )
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

        item.setCodigoProduto(
                itemDto.getCodigo()
        );

        item.setDescricao(
                itemDto.getDescricao()
        );

        item.setNcmSh(
                itemDto.getNcmSh()
        );

        item.setCst(
                itemDto.getCst()
        );

        item.setCfop(
                itemDto.getCfop()
        );

        item.setUnidade(
                itemDto.getUnidade()
        );

        item.setQuantidade(
                BigDecimal.valueOf(itemDto.getQuantidade())
        );

        item.setValorUnitario(
                itemDto.getValorUnitario()
        );

        item.setValorTotal(
                itemDto.getValorTotal()
        );

        item.setNotaFiscal(notaFiscal);

        return item;
    }


}
