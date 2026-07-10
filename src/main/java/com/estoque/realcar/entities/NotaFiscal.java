package com.estoque.realcar.entities;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonManagedReference;
=======
>>>>>>> parent of edde9da (atualizando produtos editar)
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "notas_fiscais")
@Data
public class NotaFiscal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dados Gerais
    private String numero;
    private String serie;
    private String naturezaOperacao;
<<<<<<< HEAD
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss[.SSS][XXX]")
    private LocalDateTime dataHoraEmissao;
    @JsonFormat(pattern = "HH:mm:ss")// Alterado para trabalhar com datas nativas do Java
    private LocalTime horaSaida;           // Alterado para trabalhar com horários nativos do Java
=======
    private String dataHoraEmissao;
    private String horaSaida;
>>>>>>> parent of edde9da (atualizando produtos editar)

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

    // Cálculo do Imposto (Totais)
    private Double baseCalculoIcms;
    private Double valorIcms;
    private Double baseCalculoIcmsSt;
    private Double valorIcmsSt;
    private Double valorTotalProdutos;
    private Double valorFrete;
    private Double valorSeguro;
    private Double desconto;
    private Double outrasDespesas;
    private Double valorIpi;
    private Double valorTotalNota;

    // Transportador / Volumes
    private Integer fretePorConta; // 0-Emitente, 1-Destinatário, etc.
    private String codigoAntt;
    private String placaVeiculo;
    private String ufVeiculo;
    private Integer quantidadeVolumes;
    private String especieVolumes;
    private String marcaVolumes;
    private String numeracaoVolumes;
<<<<<<< HEAD
    private BigDecimal pesoBruto;   // Alterado para BigDecimal devido às casas decimais de precisão
    private BigDecimal pesoLiquido; // Alterado para BigDecimal devido às casas decimais de precisão

    // ... restante dos atributos normais (numero, serie, etc.)

    @JsonManagedReference
    @OneToMany(mappedBy = "notaFiscal", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemNotaFiscal> itens = new ArrayList<>(); // Boa prática inicializar a lista
}

=======
    private Double pesoBruto;
    private Double pesoLiquido;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "nota_fiscal_id")
    private List<ItemNotaFiscal> itens;
}
>>>>>>> parent of edde9da (atualizando produtos editar)
