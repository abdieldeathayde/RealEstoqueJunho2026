package com.estoque.realcar.dto;

import java.math.BigDecimal;

public record ItemNotaResponseDTO(
        String codigo,       // Se aqui for "codigoProduto", atualize no JS ou na annotation
        String descricao,
        String ncm,          // Se aqui for "ncmSh", alinhe no JS
        String cst,
        String cfop,
        String unidade,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal valorTotal
) {}