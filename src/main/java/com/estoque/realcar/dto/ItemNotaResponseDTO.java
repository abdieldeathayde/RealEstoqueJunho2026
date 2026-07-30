package com.estoque.realcar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemNotaResponseDTO {
    private String codigo;
    private String descricao;
    private String ncm;
    private String cst;
    private String cfop;
    private String unidade;
    private BigDecimal quantidade;
    private BigDecimal valorUnitario;
    private BigDecimal valorTotal;
}