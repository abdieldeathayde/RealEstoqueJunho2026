package com.estoque.realcar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaFiscalResponseDTO {
    private Long id;
    private String numero;
    private String serie;
    private String naturezaOperacao;
    private LocalDateTime dataHoraEmissao;
    private String razaoSocial;
    private String cnpjCpf;
    private String inscricaoEstadual;
    private String inscricaoEstadualSt;
    private String endereco;
    private String bairro;
    private String cep;
    private String municipio;
    private String uf;
    private String fone;
    private BigDecimal baseCalculoIcms;
    private BigDecimal valorIcms;
    private BigDecimal baseCalculoIcmsSt;
    private BigDecimal valorIcmsSt;
    private BigDecimal valorFrete;
    private BigDecimal valorSeguro;
    private BigDecimal desconto;
    private BigDecimal valorIpi;
    private BigDecimal valorTotalProdutos;
    private BigDecimal valorTotalNota;
    private List<ItemNotaResponseDTO> itens; // ✅ Campo existe

    // ✅ CONSTRUTOR CORRIGIDO - ADICIONAR this.itens = itensDto;
    public NotaFiscalResponseDTO(Long id, Integer numero, Integer serie,
                                 String naturezaOperacao, LocalDateTime dataHoraEmissao,
                                 String razaoSocial, String cnpjCpf,
                                 String inscricaoEstadual, String inscricaoEstadualSt,
                                 String endereco, String bairro, String cep,
                                 String municipio, String uf, String fone,
                                 BigDecimal baseCalculoIcms, BigDecimal valorIcms,
                                 BigDecimal baseCalculoIcmsSt, BigDecimal valorIcmsSt,
                                 BigDecimal valorFrete, BigDecimal valorSeguro,
                                 BigDecimal desconto, BigDecimal valorIpi,
                                 BigDecimal valorTotalProdutos, BigDecimal valorTotalNota,
                                 List<ItemNotaResponseDTO> itensDto) {
        this.id = id;
        this.numero = String.valueOf(numero);
        this.serie = String.valueOf(serie);
        this.naturezaOperacao = naturezaOperacao;
        this.dataHoraEmissao = dataHoraEmissao;
        this.razaoSocial = razaoSocial;
        this.cnpjCpf = cnpjCpf;
        this.inscricaoEstadual = inscricaoEstadual;
        this.inscricaoEstadualSt = inscricaoEstadualSt;
        this.endereco = endereco;
        this.bairro = bairro;
        this.cep = cep;
        this.municipio = municipio;
        this.uf = uf;
        this.fone = fone;
        this.baseCalculoIcms = baseCalculoIcms;
        this.valorIcms = valorIcms;
        this.baseCalculoIcmsSt = baseCalculoIcmsSt;
        this.valorIcmsSt = valorIcmsSt;
        this.valorFrete = valorFrete;
        this.valorSeguro = valorSeguro;
        this.desconto = desconto;
        this.valorIpi = valorIpi;
        this.valorTotalProdutos = valorTotalProdutos;
        this.valorTotalNota = valorTotalNota;
        this.itens = itensDto; // ✅ LINHA CRUCIAL QUE FALTAVA!
    }
}