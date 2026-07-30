package com.estoque.realcar.entities;

import jakarta.persistence.*;
<<<<<<< HEAD
import lombok.*;
=======
import lombok.Data;
>>>>>>> 6a9f286 (adicionando modificacoes)
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

    private String codigoProduto;
    private String descricao;
    private String ncmSh;
    private String cst;
    private String cfop;
    private String unidade;
    private BigDecimal quantidade;
    private BigDecimal valorUnitario;
    private BigDecimal valorTotal;
    private BigDecimal baseCalculoIcms;
<<<<<<< HEAD
    private BigDecimal valorIcms;
    private BigDecimal valorIpi;
    private BigDecimal aliquotaIcms;
    private BigDecimal aliquotaIpi;
=======
    private Double percentualIcms;
    private Double percentualIpi;
>>>>>>> 6a9f286 (adicionando modificacoes)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nota_fiscal_id")
    private NotaFiscal notaFiscal;
}