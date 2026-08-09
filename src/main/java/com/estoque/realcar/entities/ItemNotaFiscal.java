package com.estoque.realcar.entities;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "itens_nota_fiscal")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemNotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String codigoProduto;

    @Column(length = 255, nullable = false)
    private String descricao;

    @Column(length = 20)
    private String ncmSh;

    @Column(length = 10)
    private String cst;

    @Column(length = 10)
    private String cfop;

    @Column(length = 10)
    private String unidade;

    @Column(precision = 15, scale = 3)
    private BigDecimal quantidade;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorUnitario;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorTotal;

    @Column(precision = 15, scale = 2)
    private BigDecimal baseCalculoIcms;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorIcms;

    @Column(precision = 15, scale = 2)
    private BigDecimal valorIpi;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIcms;

    @Column(precision = 5, scale = 2)
    private BigDecimal aliquotaIpi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_fiscal_id", nullable = false)
    private NotaFiscal notaFiscal;
}