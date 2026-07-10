package com.estoque.realcar.entities;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notas_fiscais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 1. Dados Gerais
    private Integer numero;
    private Integer serie;
    private String naturezaOperacao;
    private LocalDate dataHoraEmissao;
    private LocalTime horaSaida;

    // 2. Emitente / Destinatário
    private String cnpjCpf;
    private String inscricaoEstadual;
    private String inscricaoEstadualSt;
    private String razaoSocial;
    private String endereco;
    private String bairro;
    private String cep;
    private String municipio;
    private String uf;
    private String fone;

    // 3. Valores Financeiros e Impostos
    private BigDecimal baseCalculoIcms;
    private BigDecimal valorIcms;
    private BigDecimal baseCalculoIcmsSt;
    private BigDecimal valorIcmsSt;
    private BigDecimal valorTotalProdutos;
    private BigDecimal valorFrete;
    private BigDecimal valorSeguro;
    private BigDecimal desconto;
    private BigDecimal outrasDespesas;
    private BigDecimal valorIpi;
    private BigDecimal valorTotalNota;

    // 4. Transportador / Volumes
    private String fretePorConta;
    private String codigoAntt;
    private String placaVeiculo;
    private String ufVeiculo;
    private BigDecimal quantidadeVolumes;
    private String especieVolumes;
    private String marcaVolumes;
    private String numeracaoVolumes;
    private BigDecimal pesoBruto;
    private BigDecimal pesoLiquido;

    // 5. Relacionamento com Itens
    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ItemNotaFiscal> itens = new ArrayList<>();
}