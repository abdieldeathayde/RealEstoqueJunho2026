package com.estoque.realcar.service;


import com.estoque.realcar.dto.request.ProdutoRequestDTO;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import java.util.ArrayList;
import java.util.List;


@Service
public class ExcelImportService {

    private final ProdutoService produtoService;

    @Autowired
    public ExcelImportService(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    /**
     * Importa produtos de um arquivo Excel
0dc24ae (hash de senha)
     * @param file arquivo Excel com os produtos
     * @return lista de produtos importados
     * @throws IOException se houver erro ao ler o arquivo
     */

    public List<ProdutoRequestDTO> importarDePlanilha(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        if (!isExcelFile(file)) {
            throw new IllegalArgumentException("Arquivo deve ser um Excel (.xlsx ou .xls)");
        }

        List<ProdutoRequestDTO> produtos = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Pula a primeira linha (cabeçalho)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                ProdutoRequestDTO produto = extrairProdutoDaLinha(row);
                if (produto != null) {
                    produtos.add(produto);
                }
            }
        }

        return produtos;
    }

    //    public List<ProdutoRequestDTO> importarDePlanilha(MultipartFile file) throws IOException {
//        if (file.isEmpty()) {
//            throw new IllegalArgumentException("Arquivo vazio");
//        }
//
//        if (!isExcelFile(file)) {
//            throw new IllegalArgumentException("Arquivo deve ser um Excel (.xlsx ou .xls)");
//        }
//
//        List<ProdutoRequestDTO> produtos = new ArrayList<>();
//
//        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
//            Sheet sheet = workbook.getSheetAt(0);
//
//            // Pula a primeira linha (cabeçalho)
//            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
//                Row row = sheet.getRow(i);
//
//                if (row == null || isRowEmpty(row)) {
//                    continue;
//                }
//
//                ProdutoRequestDTO produto = extrairProdutoDaLinha(row);
//                if (produto != null) {
//                    produtos.add(produto);
//                }
//            }
//        }
//
//        return produtos;
//    }

    /**
     * Importa produtos e os salva no banco de dados
     *

     * @param file arquivo Excel com os produtos
     * @return número de produtos importados e salvos
     * @throws IOException se houver erro ao ler o arquivo
     */
    public int importarESalvar(MultipartFile file) throws IOException {
        List<ProdutoRequestDTO> produtos = importarDePlanilha(file);
        
        for (ProdutoRequestDTO produto : produtos) {
            try {
                produtoService.salvar(produto);
            } catch (Exception e) {
                System.err.println("Erro ao salvar produto: " + produto.getNome() + " - " + e.getMessage());
            }
        }
        
        return produtos.size();
    }

    /**
     * Extrai um produto de uma linha do Excel
     * Esperado formato: Coluna A = Nome, Coluna B = Quantidade, Coluna C = Preço
     * @param row linha do Excel
     * @return objeto ProdutoRequestDTO ou null se inválido
     */
    private ProdutoRequestDTO extrairProdutoDaLinha(Row row) {
        try {
            Cell nomeCell = row.getCell(0);
            Cell quantidadeCell = row.getCell(1);
            Cell precoCell = row.getCell(2);

            if (nomeCell == null) {
                return null;
            }

            String nome = getCellStringValue(nomeCell).trim();
            if (nome.isEmpty()) {
                return null;
            }

            Integer quantidade = getCellIntValue(quantidadeCell);
            if (quantidade == null) {
                return null;
            }

            Double preco = getCellDoubleValue(precoCell);
            if (preco == null) {
                return null;
            }

            ProdutoRequestDTO dto = new ProdutoRequestDTO();
            dto.setNome(nome);
            dto.setQuantidade(quantidade);
            dto.setPreco(preco);

            return dto;
        } catch (Exception e) {
            System.err.println("Erro ao processar linha: " + e.getMessage());
            return null;
        }
    }


    /**
     * Obtém valor de string da célula, independente do tipo
     */

    private String getCellStringValue(Cell cell) {
        if (cell == null) {
            return "";
        }

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((int) cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }

        return cell.toString();
    }


    /**
     * Obtém valor inteiro da célula
     */

    private Integer getCellIntValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                if (!value.isEmpty()) {
                    return Integer.parseInt(value);
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("Erro ao converter para inteiro: " + e.getMessage());
        }
        
        return null;
    }


    /**
     * Obtém valor double da célula
     */

    private Double getCellDoubleValue(Cell cell) {
        if (cell == null) {
            return null;
        }
        
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getNumericCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                String value = cell.getStringCellValue().trim();
                if (!value.isEmpty()) {
                    return Double.parseDouble(value.replace(",", "."));
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("Erro ao converter para double: " + e.getMessage());
        }
        
        return null;
    }


    /**
     * Verifica se uma linha está vazia
     */

    private boolean isRowEmpty(Row row) {
        if (row == null) {
            return true;
        }
        
        for (int i = 0; i < 3; i++) {
            Cell cell = row.getCell(i);
            if (cell != null) {
                if (cell.getCellType() == CellType.BLANK) {
                    continue;
                }
                
                String value = getCellStringValue(cell).trim();
                if (!value.isEmpty()) {
                    return false;
                }
            }
        }
        
        return true;
    }

//    private boolean isRowEmpty(Row row) {
//        if (row == null) {
//            return true;
//        }
//
//        for (int i = 0; i < 3; i++) {
//            Cell cell = row.getCell(i);
//            if (cell != null) {
//                if (cell.getCellType() == CellType.BLANK) {
//                    continue;
//                }
//
//                String value = getCellStringValue(cell).trim();
//                if (!value.isEmpty()) {
//                    return false;
//                }
//            }
//        }
//
//        return true;
//    }


    /**
     * Verifica se o arquivo é um Excel válido
     */
    private boolean isExcelFile(MultipartFile file) {
        String filename = file.getOriginalFilename();
        return filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
    }
}
