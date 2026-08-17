package com.estoque.realcar.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String razaoSocial;

    @Column(unique = true)
    private String cnpjCpf;

    private String inscricaoEstadual;

    private String inscricaoEstadualSt;

    private String endereco;

    private String bairro;

    private String cep;

    private String municipio;

    @Column(length = 2)
    private String uf;

    private String fone;

    @OneToMany(mappedBy = "cliente")
    private List<NotaFiscal> notasFiscais = new ArrayList<>();
}