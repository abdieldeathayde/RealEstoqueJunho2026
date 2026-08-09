package com.estoque.realcar.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal valor;
}
