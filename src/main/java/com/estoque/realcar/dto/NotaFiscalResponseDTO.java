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
    private List<ItemNotaResponseDTO> itens;

}