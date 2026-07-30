package com.estoque.realcar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemNotaRequestDTO {

    private String codigo;

    @NotBlank(message = "A descrição do item é obrigatória")
    private String descricao;

    private String ncm;
    private String cst;
    private String cfop;
    private String unidade;

    @NotNull(message = "A quantidade é obrigatória")
    private BigDecimal quantidade;

    @NotNull(message = "O valor unitário é obrigatório")
    private BigDecimal valorUnitario;

    @NotNull(message = "O valor total do item é obrigatório")
    private BigDecimal valorTotal;
}