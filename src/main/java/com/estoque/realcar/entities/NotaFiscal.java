package com.estoque.realcar.entities;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
=======
import lombok.Data;

import java.time.LocalDate;
>>>>>>> 6a9f286 (adicionando modificacoes)
import java.util.List;
import java.math.BigDecimal;

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
<<<<<<< HEAD
    private LocalTime horaSaida;
=======
    private String horaSaida;
>>>>>>> 6a9f286 (adicionando modificacoes)

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

<<<<<<< HEAD
    // 3. Valores Financeiros e Impostos
=======
    // Cálculo do Imposto (Totais)
>>>>>>> 6a9f286 (adicionando modificacoes)
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

<<<<<<< HEAD
    // 5. Relacionamento com Itens
    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ItemNotaFiscal> itens = new ArrayList<>();
=======
    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemNotaFiscal> itens;

>>>>>>> 6a9f286 (adicionando modificacoes)
}