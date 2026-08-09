package com.estoque.realcar.service;

import com.estoque.realcar.dto.request.ProdutoRequestDTO;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ExcelImportService {

    private final ProdutoService produtoService;

    public ExcelImportService(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    public List<ProdutoRequestDTO> importarDePlanilha(MultipartFile file) throws Exception {
        List<ProdutoRequestDTO> lista = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) {
                return lista;
            }

            // Mapeia posições das colunas removendo espaços extras
            Row headerRow = rowIterator.next();
            Map<String, Integer> colunasMap = new HashMap<>();

            for (Cell cell : headerRow) {
                String headerName = getCellValueAsString(cell).trim().toLowerCase();
                if (headerName.contains("cód") || headerName.contains("cod")) {
                    colunasMap.put("codigo", cell.getColumnIndex());
                } else if (headerName.contains("desc")) {
                    colunasMap.put("descricao", cell.getColumnIndex());
                } else if (headerName.contains("qtd") || headerName.contains("quant")) {
                    colunasMap.put("quantidade", cell.getColumnIndex());
                } else if (headerName.contains("valor") || headerName.contains("preco")) {
                    colunasMap.put("valor", cell.getColumnIndex());
                }
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                if (isRowEmpty(row)) continue;

                ProdutoRequestDTO dto = new ProdutoRequestDTO();

                if (colunasMap.containsKey("codigo")) {
                    dto.setCodigo(getCellValueAsString(row.getCell(colunasMap.get("codigo"))));
                }
                if (colunasMap.containsKey("descricao")) {
                    dto.setDescricao(getCellValueAsString(row.getCell(colunasMap.get("descricao"))));
                }
                if (colunasMap.containsKey("quantidade")) {
                    String qtdStr = getCellValueAsString(row.getCell(colunasMap.get("quantidade")));
                    dto.setQuantidade(parseInteger(qtdStr));
                }
                if (colunasMap.containsKey("valor")) {
                    String valStr = getCellValueAsString(row.getCell(colunasMap.get("valor")));
                    dto.setValor(parseBigDecimal(valStr));
                }

                // Apenas adiciona se tiver ao menos código ou descrição
                if (dto.getCodigo() != null && !dto.getCodigo().isBlank()) {
                    lista.add(dto);
                }
            }
        }

        return lista;
    }

    public int importarESalvar(MultipartFile file) throws Exception {
        List<ProdutoRequestDTO> produtos = importarDePlanilha(file);
        for (ProdutoRequestDTO dto : produtos) {
            produtoService.salvar(dto);
        }
        return produtos.size();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double num = cell.getNumericCellValue();
                if (num == (long) num) {
                    return String.valueOf((long) num);
                } else {
                    return String.valueOf(num);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return String.valueOf(cell.getNumericCellValue());
                } catch (Exception e) {
                    return cell.getStringCellValue().trim();
                }
            default:
                return "";
        }
    }

    private Integer parseInteger(String str) {
        try {
            if (str == null || str.isBlank()) return 0;
            return (int) Double.parseDouble(str.replace(",", "."));
        } catch (Exception e) {
            return 0;
        }
    }

    private BigDecimal parseBigDecimal(String str) {
        try {
            if (str == null || str.isBlank()) return BigDecimal.ZERO;
            String limpo = str.replaceAll("[^0-9,-.]", "").replace(",", ".");
            return new BigDecimal(limpo);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValueAsString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }
}