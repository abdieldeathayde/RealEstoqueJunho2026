package com.estoque.realcar.entities;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonBackReference;
=======
>>>>>>> parent of edde9da (atualizando produtos editar)
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "itens_nota_fiscal") // ou o nome que definiu para a tabela de itens
@Getter
@Setter
public class ItemNotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

<<<<<<< HEAD
    // Seus campos normais: codigo, descricao, ncm, cst, cfop, quantidade, valorUnitario...

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "nota_fiscal_id")
    private NotaFiscal notaFiscal; // O mapeamento bidirecional correto fica aqui!
=======
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
>>>>>>> parent of edde9da (atualizando produtos editar)
}