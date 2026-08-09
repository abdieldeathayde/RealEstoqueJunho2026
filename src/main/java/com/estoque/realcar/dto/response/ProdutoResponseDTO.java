package com.estoque.realcar.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProdutoResponseDTO {

    private Long id;
    private String codigo;
    private String descricao;
    private Integer quantidade;
    private Double valor;
}