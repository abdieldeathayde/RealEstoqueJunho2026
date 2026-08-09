package com.estoque.realcar.service;

import com.estoque.realcar.dto.request.ProdutoRequestDTO;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelImportService {


    private static final Logger log =
            LoggerFactory.getLogger(ExcelImportService.class);

    private final ProdutoService produtoService;

    public ExcelImportService(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    /**
     * Importa produtos de um arquivo Excel.
     *
     * Formato esperado:
     *
     * Coluna A = Código
     * Coluna B = Descrição
     * Coluna C = Quantidade
     * Coluna D = Valor
     *
     * A primeira linha é considerada o cabeçalho.
     */
    public List<ProdutoRequestDTO> importarDePlanilha(
            MultipartFile file) throws IOException {

        validarArquivo(file);

        List<ProdutoRequestDTO> produtos = new ArrayList<>();

        try (Workbook workbook = criarWorkbook(file)) {

            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException(
                        "O arquivo Excel não possui nenhuma planilha."
                );
            }

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);

                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                ProdutoRequestDTO produto =
                        extrairProdutoDaLinha(row);

                if (produto != null) {
                    produtos.add(produto);
                }
            }
        }

        return produtos;
    }

    /**
     * Importa produtos e salva no banco de dados.
     */
    public int importarESalvar(MultipartFile file)
            throws IOException {

        List<ProdutoRequestDTO> produtos =
                importarDePlanilha(file);

        int quantidadeImportada = 0;

        for (ProdutoRequestDTO produto : produtos) {

            try {

                produtoService.salvar(produto);

                quantidadeImportada++;

            } catch (Exception e) {

                log.error(
                        "Erro ao salvar produto '{}': {}",
                        produto.getDescricao(),
                        e.getMessage(),
                        e
                );
            }
        }

        return quantidadeImportada;
    }

    /**
     * Extrai um produto de uma linha do Excel.
     *
     * A = Código
     * B = Descrição
     * C = Quantidade
     * D = Valor
     */
    private ProdutoRequestDTO extrairProdutoDaLinha(Row row) {

        try {

            Cell codigoCell = row.getCell(0);
            Cell descricaoCell = row.getCell(1);
            Cell quantidadeCell = row.getCell(2);
            Cell valorCell = row.getCell(3);

            if (codigoCell == null || descricaoCell == null) {
                return null;
            }

            Integer codigo =
                    getCellIntValue(codigoCell);

            String descricao =
                    getCellStringValue(descricaoCell).trim();

            Integer quantidade =
                    getCellIntValue(quantidadeCell);

            BigDecimal valor =
                    getCellBigDecimalValue(valorCell);

            // Validação do código
            if (codigo == null || codigo <= 0) {

                log.warn(
                        "Código inválido na linha {}",
                        row.getRowNum() + 1
                );

                return null;
            }

            // Validação da descrição
            if (descricao.isEmpty()) {

                log.warn(
                        "Descrição vazia na linha {}",
                        row.getRowNum() + 1
                );

                return null;
            }

            // Validação da quantidade
            if (quantidade == null || quantidade < 0) {

                log.warn(
                        "Quantidade inválida na linha {}",
                        row.getRowNum() + 1
                );

                return null;
            }

            // Validação do valor
            if (valor == null ||
                    valor.compareTo(BigDecimal.ZERO) < 0) {

                log.warn(
                        "Valor inválido na linha {}",
                        row.getRowNum() + 1
                );

                return null;
            }

            ProdutoRequestDTO dto =
                    new ProdutoRequestDTO();

            dto.setCodigo(codigo);
            dto.setDescricao(descricao);
            dto.setQuantidade(quantidade);
            dto.setValor(valor);

            return dto;

        } catch (Exception e) {

            log.error(
                    "Erro ao processar a linha {}: {}",
                    row.getRowNum() + 1,
                    e.getMessage(),
                    e
            );

            return null;
        }
    }

    /**
     * Obtém o valor textual de uma célula.
     */
    private String getCellStringValue(Cell cell) {

        if (cell == null ||
                cell.getCellType() == CellType.BLANK) {

            return "";
        }

        return switch (cell.getCellType()) {

            case STRING ->
                    cell.getStringCellValue();

            case NUMERIC ->
                    BigDecimal.valueOf(
                            cell.getNumericCellValue()
                    ).stripTrailingZeros().toPlainString();

            case BOOLEAN ->
                    String.valueOf(
                            cell.getBooleanCellValue()
                    );

            case FORMULA -> {

                if (cell.getCachedFormulaResultType()
                        == CellType.STRING) {

                    yield cell.getStringCellValue();

                } else if (cell.getCachedFormulaResultType()
                        == CellType.NUMERIC) {

                    yield BigDecimal.valueOf(
                            cell.getNumericCellValue()
                    ).stripTrailingZeros().toPlainString();

                } else {

                    yield cell.toString();
                }
            }

            default ->
                    cell.toString();
        };
    }

    /**
     * Obtém um valor inteiro da célula.
     */
    private Integer getCellIntValue(Cell cell) {

        if (cell == null ||
                cell.getCellType() == CellType.BLANK) {

            return null;
        }

        try {

            if (cell.getCellType() == CellType.NUMERIC) {

                double valor =
                        cell.getNumericCellValue();

                if (valor % 1 != 0) {
                    return null;
                }

                if (valor > Integer.MAX_VALUE ||
                        valor < Integer.MIN_VALUE) {

                    return null;
                }

                return (int) valor;
            }

            if (cell.getCellType() == CellType.STRING) {

                String valor =
                        cell.getStringCellValue().trim();

                if (valor.isEmpty()) {
                    return null;
                }

                return Integer.parseInt(valor);
            }

        } catch (NumberFormatException e) {

            log.warn(
                    "Não foi possível converter '{}' para inteiro.",
                    cell
            );
        }

        return null;
    }

    /**
     * Obtém um valor monetário como BigDecimal.
     *
     * Aceita:
     *
     * 129.90
     * 129,90
     */
    private BigDecimal getCellBigDecimalValue(Cell cell) {

        if (cell == null ||
                cell.getCellType() == CellType.BLANK) {

            return null;
        }

        try {

            if (cell.getCellType() == CellType.NUMERIC) {

                return BigDecimal.valueOf(
                        cell.getNumericCellValue()
                );
            }

            if (cell.getCellType() == CellType.STRING) {

                String valor =
                        cell.getStringCellValue().trim();

                if (valor.isEmpty()) {
                    return null;
                }

                /*
                 * Aceita:
                 *
                 * 129.90
                 * 129,90
                 */

                valor = valor.replace(",", ".");

                return new BigDecimal(valor);
            }

        } catch (NumberFormatException e) {

            log.warn(
                    "Não foi possível converter '{}' para BigDecimal.",
                    cell
            );
        }

        return null;
    }

    /**
     * Verifica se uma linha está vazia.
     */
    private boolean isRowEmpty(Row row) {

        if (row == null) {
            return true;
        }

        // São 4 colunas:
        // Código, Descrição, Quantidade e Valor.
        for (int i = 0; i < 4; i++) {

            Cell cell = row.getCell(i);

            if (cell == null ||
                    cell.getCellType() == CellType.BLANK) {

                continue;
            }

            String valor =
                    getCellStringValue(cell).trim();

            if (!valor.isEmpty()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Valida o arquivo recebido.
     */
    private void validarArquivo(MultipartFile file) {

        if (file == null || file.isEmpty()) {

            throw new IllegalArgumentException(
                    "Arquivo vazio ou não informado."
            );
        }

        if (!isExcelFile(file)) {

            throw new IllegalArgumentException(
                    "Arquivo deve estar no formato Excel (.xlsx)."
            );
        }
    }

    /**
     * Cria o Workbook a partir do arquivo.
     */
    private Workbook criarWorkbook(
            MultipartFile file) throws IOException {

        String filename =
                file.getOriginalFilename();

        if (filename == null ||
                !filename.toLowerCase().endsWith(".xlsx")) {

            throw new IllegalArgumentException(
                    "Apenas arquivos .xlsx são suportados."
            );
        }

        return new XSSFWorkbook(
                file.getInputStream()
        );
    }

    /**
     * Verifica se o arquivo é um Excel .xlsx.
     */
    private boolean isExcelFile(MultipartFile file) {

        String filename =
                file.getOriginalFilename();

        if (filename == null) {
            return false;
        }

        return filename
                .toLowerCase()
                .endsWith(".xlsx");
    }


}
