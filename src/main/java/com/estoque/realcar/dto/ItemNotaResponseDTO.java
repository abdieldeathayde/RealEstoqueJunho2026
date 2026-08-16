package com.estoque.realcar.dto;

import java.math.BigDecimal;

public record ItemNotaResponseDTO(
        String codigo,       // ← Atenção: o campo é "codigo", não "codigoProduto"
        String descricao,
        String ncm,          // ← Atenção: o campo é "ncm", não "ncmSh"
        String cst,
        String cfop,
        String unidade,
        BigDecimal quantidade,
        BigDecimal valorUnitario,
        BigDecimal valorTotal
) {}