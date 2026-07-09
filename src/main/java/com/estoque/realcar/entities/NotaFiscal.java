package com.estoque.realcar.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "notas_fiscais")
@Getter
@Setter // Substituindo @Data por Getter/Setter para evitar StackOverflowError com o Hibernate
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dados Gerais
    private String numero;
    private String serie;
    private String naturezaOperacao;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSS][XXX]")
    private LocalDateTime dataHoraEmissao;
    @JsonFormat(pattern = "HH:mm:ss")// Alterado para trabalhar com datas nativas do Java
    private LocalTime horaSaida;           // Alterado para trabalhar com horários nativos do Java

    // Emitente / Destinatário
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

    // Cálculo do Imposto (Totais) - Alterados para BigDecimal para evitar erros de arredondamento
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

    // Transportador / Volumes
    private Integer fretePorConta; // 0-Emitente, 1-Destinatário, etc.
    private String codigoAntt;
    private String placaVeiculo;
    private String ufVeiculo;
    private Integer quantidadeVolumes;
    private String especieVolumes;
    private String marcaVolumes;
    private String numeracaoVolumes;
    private BigDecimal pesoBruto;   // Alterado para BigDecimal devido às casas decimais de precisão
    private BigDecimal pesoLiquido; // Alterado para BigDecimal devido às casas decimais de precisão

    // ... restante dos atributos normais (numero, serie, etc.)

    @JsonManagedReference
    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemNotaFiscal> itens = new ArrayList<>(); // Boa prática inicializar a lista
}

