package com.estoque.realcar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotaFiscalRequestDTO {

    @NotBlank(message = "O número da nota é obrigatório")
    private String numero;

    @NotBlank(message = "A série da nota é obrigatória")
    private String serie;

    @NotBlank(message = "A natureza da operação é obrigatória")
    private String naturezaOperacao;

    @NotNull(message = "A data e hora de emissão são obrigatórias")
    private LocalDateTime dataHoraEmissao;

    @NotBlank(message = "A razão social é obrigatória")
    private String razaoSocial;

    @NotBlank(message = "O CNPJ ou CPF é obrigatório")
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

    @NotNull(message = "O valor total dos produtos é obrigatório")
    private BigDecimal valorTotalProdutos;

    @NotNull(message = "O valor total da nota é obrigatório")
    private BigDecimal valorTotalNota;

    @NotEmpty(message = "A nota fiscal deve conter pelo menos um item")
    @Valid
    private List<ItemNotaRequestDTO> itens;
}
