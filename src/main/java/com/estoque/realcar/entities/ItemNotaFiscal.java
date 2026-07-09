package com.estoque.realcar.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "itens_nota_fiscal")
@Data
public class ItemNotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String codigo;
    private String descricao;
    private String ncm;
    private String cst;
    private String cfop;
    private String unidade;
    private Double quantidade;
    private Double valorUnitario;
    private Double valorTotal;
    private Double baseCalculoIcms;
    private Double percentualIcms;
    private Double percentualIpi;

    @ManyToOne
    @JoinColumn(name = "nota_fiscal_id", nullable = false)
    @JsonIgnoreProperties("itens") // <-- ISSO AQUI IMPEDE O LOOP INFINITO NO JSON
    private NotaFiscal notaFiscal;
}