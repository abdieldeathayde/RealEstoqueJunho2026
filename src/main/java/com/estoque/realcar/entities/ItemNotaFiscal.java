package com.estoque.realcar.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
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

    // Seus campos normais: codigo, descricao, ncm, cst, cfop, quantidade, valorUnitario...

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "nota_fiscal_id")
    private NotaFiscal notaFiscal; // O mapeamento bidirecional correto fica aqui!
}