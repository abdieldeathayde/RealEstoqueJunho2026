package com.estoque.realcar.service;

import com.estoque.realcar.dto.request.ProdutoRequestDTO;
import com.estoque.realcar.dto.response.ProdutoResponseDTO;
import com.estoque.realcar.entities.Produto;
import com.estoque.realcar.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    @Autowired
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
        return produtoRepository.findById(id).map(this::toDTO);
    }

    public ProdutoResponseDTO salvar(ProdutoRequestDTO dto) {
        Produto produto = toEntity(dto);
        Produto salvo = produtoRepository.save(produto);
        return toDTO(salvo);
    }

    public Optional<ProdutoResponseDTO> atualizar(Long id, ProdutoRequestDTO dto) {
        return produtoRepository.findById(id).map(existing -> {
            existing.setNome(dto.getNome());
            existing.setQuantidade(dto.getQuantidade());
            existing.setPreco(dto.getPreco() != null ? BigDecimal.valueOf(dto.getPreco()) : null);
            Produto atualizado = produtoRepository.save(existing);
            return toDTO(atualizado);
        });
    }

    public boolean deletar(Long id) {
        return produtoRepository.findById(id).map(prod -> {
            produtoRepository.delete(prod);
            return true;
        }).orElse(false);
    }

    public Produto toEntity(ProdutoRequestDTO dto) {
        Produto p = new Produto();
        p.setNome(dto.getNome());
        p.setQuantidade(dto.getQuantidade());
        p.setPreco(dto.getPreco() != null ? BigDecimal.valueOf(dto.getPreco()) : null);
        return p;
    }

    public ProdutoResponseDTO toDTO(Produto produto) {
        if (produto == null) {
            return null;
        }

        // Opção 1: Se o seu ProdutoResponseDTO for uma classe com Construtor completo
        Double precoDouble = produto.getPreco() != null ? produto.getPreco().doubleValue() : 0.0;
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getNome(),
                produto.getQuantidade(),
                precoDouble
        );
    }
}