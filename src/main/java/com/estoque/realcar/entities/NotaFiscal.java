package com.estoque.realcar.entities;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private LocalDateTime dataHoraEmissao;

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
    @Column(precision = 15, scale = 2)
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


    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemNotaFiscal> itens = new ArrayList<>();


    public void adicionarItem(ItemNotaFiscal item) {
        itens.add(item);
        item.setNotaFiscal(this);
    }


}