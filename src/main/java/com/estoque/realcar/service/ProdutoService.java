package com.estoque.realcar.service;

import com.estoque.realcar.dto.request.ProdutoRequestDTO;
import com.estoque.realcar.dto.response.ProdutoResponseDTO;
import com.estoque.realcar.entities.Produto;
import com.estoque.realcar.repository.ProdutoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public List<ProdutoResponseDTO> listarTodos() {
        return produtoRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProdutoResponseDTO> buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .map(this::toDTO);
    }

    public ProdutoResponseDTO salvar(ProdutoRequestDTO dto) {

        Produto produto = toEntity(dto);

        Produto salvo = produtoRepository.save(produto);

        return toDTO(salvo);
    }

    public Optional<ProdutoResponseDTO> atualizar(
            Long id,
            ProdutoRequestDTO dto) {

        return produtoRepository.findById(id)
                .map(produto -> {

                    produto.setCodigo(
                            dto.getCodigo() != null
                                    ? (dto.getCodigo())
                                    : null
                    );

                    produto.setDescricao(dto.getDescricao());
                    produto.setQuantidade(dto.getQuantidade());
                    produto.setValor(dto.getValor());

                    Produto atualizado =
                            produtoRepository.save(produto);

                    return toDTO(atualizado);
                });
    }

    public boolean deletar(Long id) {

        return produtoRepository.findById(id)
                .map(produto -> {

                    produtoRepository.delete(produto);

                    return true;
                })
                .orElse(false);
    }

    public Produto toEntity(ProdutoRequestDTO dto) {

        Produto produto = new Produto();

        produto.setCodigo(
                dto.getCodigo() != null
                        ? (dto.getCodigo())
                        : null
        );

        produto.setDescricao(dto.getDescricao());
        produto.setQuantidade(dto.getQuantidade());
        produto.setValor(dto.getValor());

        return produto;
    }

    public ProdutoResponseDTO toDTO(Produto produto) {

        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getCodigo(),
                produto.getDescricao(),
                produto.getQuantidade(),
                produto.getValor() != null
                        ? produto.getValor().doubleValue()
                        : null
        );
    }
}

