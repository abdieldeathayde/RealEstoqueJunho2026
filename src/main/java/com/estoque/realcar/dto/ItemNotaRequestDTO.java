package com.estoque.realcar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemNotaRequestDTO {


    private String codigo;

    @NotBlank(message = "A descrição do item é obrigatória")
    private String descricao;

    private String ncmSh;

    private String cst;

    private String cfop;

    private String unidade;

    @NotNull(message = "A quantidade é obrigatória")
    private Integer quantidade;

    @NotNull(message = "O valor unitário é obrigatório")
    private BigDecimal valorUnitario;

    @NotNull(message = "O valor total do item é obrigatório")
    private BigDecimal valorTotal;


}
