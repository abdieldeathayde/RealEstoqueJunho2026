# Guia Completo: Importação de Excel com Java Spring Boot

## 📋 Resumo da Implementação

Este documento detalha como foi implementado o sistema de importação de arquivos Excel (.xlsx) no projeto **Estoque RealCar** usando Java com Spring Boot e Apache POI.

## 🎯 Objetivo

Permitir que usuários importem dados de produtos a partir de um arquivo Excel para o banco de dados da aplicação, com validação e preview antes da importação.

---

## 📦 Dependências Adicionadas

### pom.xml - Principais Dependências

```xml
<!-- Apache POI para leitura de Excel -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>

<!-- Spring Boot Starter Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Boot Starter Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

---

## 🏗️ Arquitetura da Solução

### Fluxo de Importação

```
Usuário Seleciona Arquivo
        ↓
[Frontend] Envia arquivo via FormData
        ↓
[ProdutoController] Recebe requisição
        ↓
[ExcelImportService] Processa o arquivo
        ↓
Validação de Dados
        ↓
Opção 1: Visualizar (retorna preview)
Opção 2: Importar (salva no BD)
        ↓
[ProdutoService] Salva produtos
        ↓
[ProdutoRepository] Persiste no BD
        ↓
Retorna resposta ao cliente
```

---

## 🔧 Classes Implementadas

### 1. ExcelImportService (Backend)

**Localização:** `src/main/java/com/estoque/realcar/service/ExcelImportService.java`

**Responsabilidades:**
- Ler arquivos Excel (.xlsx)
- Extrair dados das células
- Validar informações
- Converter para objetos DTO
- Salvar no banco de dados

**Principais Métodos:**

```java
// Importa e retorna lista de DTOs
public List<ProdutoRequestDTO> importarDePlanilha(MultipartFile file) throws IOException

// Importa e salva no banco
public int importarESalvar(MultipartFile file) throws IOException

// Extrai valor de string da célula (suporta múltiplos tipos)
private String getCellStringValue(Cell cell)

// Extrai inteiro da célula
private Integer getCellIntValue(Cell cell)

// Extrai decimal da célula
private Double getCellDoubleValue(Cell cell)
```

**Recursos Especiais:**
- ✅ Suporta células com valores em diferentes tipos (texto, número, boolean)
- ✅ Tratamento de decimais com vírgula ou ponto
- ✅ Conversão automática de tipos
- ✅ Validação de linhas vazias
- ✅ Tratamento robusto de exceções

### 2. ProdutoController (Backend)

**Novos Endpoints:**

#### POST `/produtos/importar/visualizar`
```javascript
// Frontend
const formData = new FormData();
formData.append('file', arquivo);

fetch('http://localhost:8080/produtos/importar/visualizar', {
    method: 'POST',
    body: formData
})
.then(res => res.json())
.then(data => {
    console.log(`${data.total} produtos encontrados`);
    console.log(data.produtos); // Array com preview dos dados
})
```

**Response:**
```json
{
    "total": 5,
    "mensagem": "Produtos prontos para importar",
    "produtos": [
        {
            "nome": "Notebook Dell",
            "quantidade": 15,
            "preco": 4299.99
        },
        {
            "nome": "Mouse Wireless",
            "quantidade": 42,
            "preco": 129.90
        }
    ]
}
```

#### POST `/produtos/importar`
Realiza a importação definitiva e salva no banco.

**Response:**
```json
{
    "sucesso": true,
    "totalImportado": 5,
    "mensagem": "5 produto(s) importado(s) com sucesso"
}
```

### 3. ProdutoRepository (Backend)

Interface que estende `JpaRepository` para operações CRUD:

```java
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
}
```

### 4. Frontend - script.js

**Novas Funções:**

```javascript
// Inicializa listeners do formulário
function setupExcelImport()

// Valida e visualiza importação
function importarPlanilha(file)

// Realiza importação definitiva
function realizarImportacao(file)

// Utilitários
function isExcelFile(file)
function validateFileSize(file)
```

**Fluxo:**
1. Usuário seleciona arquivo
2. `importarPlanilha()` valida e faz preview
3. Usuário confirma
4. `realizarImportacao()` envia dados
5. Produtos são salvos
6. Lista é atualizada automaticamente

---

## 📊 Formato do Arquivo Excel

### Estrutura Esperada

```
┌─────────────────────────────────┬──────────────┬─────────────┐
│ Nome                            │ Quantidade   │ Preço       │
├─────────────────────────────────┼──────────────┼─────────────┤
│ Notebook Dell Inspiron          │ 15           │ 4299.99     │
├─────────────────────────────────┼──────────────┼─────────────┤
│ Mouse Logitech Wireless         │ 42           │ 129.90      │
├─────────────────────────────────┼──────────────┼─────────────┤
│ Teclado Mecânico RGB            │ 8            │ 349.90      │
└─────────────────────────────────┴──────────────┴─────────────┘
```

### Requisitos

- **Extensão:** `.xlsx` (Excel 2007+) ou `.xls`
- **Primeira Linha:** Cabeçalho (ignorada automaticamente)
- **Coluna A:** Nome do produto (texto obrigatório)
- **Coluna B:** Quantidade (inteiro obrigatório)
- **Coluna C:** Preço (decimal obrigatório)
- **Máximo:** 10 MB (configurável em `application.properties`)

### Validações Aplicadas

```
┌─ Validação de Arquivo
│  ├─ Extensão .xlsx/.xls
│  ├─ Tamanho máximo (10MB)
│  └─ Arquivo não vazio
│
├─ Validação de Linha
│  ├─ Nome não vazio
│  ├─ Quantidade >= 0 (inteiro)
│  └─ Preço >= 0 (decimal)
│
└─ Validação de Célula
   ├─ Tipo de dado (string, number, boolean)
   ├─ Conversão automática
   └─ Tratamento de decimais (, ou .)
```

---

## 🚀 Como Usar

### 1. Preparar Arquivo Excel

```
Opção A: Usar arquivo de exemplo
  - Arquivo: produtos_exemplo.xlsx
  - Contém 10 produtos de teste

Opção B: Criar novo arquivo
  - Abra Excel/LibreOffice Calc
  - Crie as colunas: Nome | Quantidade | Preço
  - Adicione seus dados
  - Salve como .xlsx
```

### 2. Compilar Projeto

```bash
# Compilar
mvn clean install

# Ou apenas verificar sintaxe
mvn clean compile
```

### 3. Executar Aplicação

**Opção 1: Maven**
```bash
mvn spring-boot:run
```

**Opção 2: JAR**
```bash
mvn clean package
java -jar target/realcar-1.0-SNAPSHOT.jar
```

**Opção 3: Scripts fornecidos**
```bash
# Windows
run.bat

# PowerShell
.\run.ps1
```

### 4. Acessar Interface

Abra navegador e acesse:
```
http://localhost:8080
```

### 5. Importar Dados

1. Localize seção "Importar Planilha Excel"
2. Clique em "Escolher arquivo"
3. Selecione arquivo `.xlsx`
4. Clique em "Importar"
5. Revise o preview
6. Confirme importação
7. Pronto! Dados salvos no banco

---

## 💾 Banco de Dados

### Configuração

```properties
# application.properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.hibernate.ddl-auto=create-drop
```

### Tabela Produto

```sql
CREATE TABLE PRODUTO (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    preco DOUBLE NOT NULL
);
```

### Acesso ao H2 Console

```
http://localhost:8080/h2-console
URL JDBC: jdbc:h2:mem:testdb
Usuário: sa
Senha: (deixe vazio)
```

---

## 🔍 Tratamento de Erros

### Erros Esperados e Tratamento

| Erro | Causa | Solução |
|------|-------|---------|
| Arquivo vazio | Selecionado arquivo sem dados | Verifique arquivo |
| Formato inválido | Arquivo não é .xlsx/.xls | Use extensão correta |
| Célula vazia | Nome do produto faltando | Preencha coluna A |
| Tipo inválido | Quantidade não é número | Use números inteiros |
| Preço negativo | Preço < 0 | Valores devem ser >= 0 |

### Logs

```bash
# Ver logs detalhados
tail -f target/logs/application.log

# Ou via console
DEBUG [ExcelImportService] - Processando linha...
DEBUG [ProdutoService] - Salvando produto...
```

---

## 🧪 Testando a Importação

### Com cURL

```bash
# 1. Visualizar importação
curl -F "file=@produtos_exemplo.xlsx" \
  http://localhost:8080/produtos/importar/visualizar

# 2. Realizar importação
curl -F "file=@produtos_exemplo.xlsx" \
  http://localhost:8080/produtos/importar

# 3. Listar produtos importados
curl http://localhost:8080/produtos
```

### Com JavaScript

```javascript
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

// Preview
fetch('/produtos/importar/visualizar', {
    method: 'POST',
    body: formData
})
.then(r => r.json())
.then(data => console.log(`${data.total} produtos encontrados`));

// Importar
fetch('/produtos/importar', {
    method: 'POST',
    body: formData
})
.then(r => r.json())
.then(data => console.log(data.mensagem));
```

---

## 🛠️ Customização

### Alterar Colunas do Excel

No arquivo `ExcelImportService.java`, método `extrairProdutoDaLinha()`:

```java
// Padrão (Coluna A, B, C)
Cell nomeCell = row.getCell(0);      // Coluna A
Cell quantidadeCell = row.getCell(1); // Coluna B
Cell precoCell = row.getCell(2);     // Coluna C

// Customizado (se mudar para D, E, F)
Cell nomeCell = row.getCell(3);      // Coluna D
Cell quantidadeCell = row.getCell(4); // Coluna E
Cell precoCell = row.getCell(5);     // Coluna F
```

### Adicionar Validações

```java
private ProdutoRequestDTO extrairProdutoDaLinha(Row row) {
    // ... código existente ...
    
    // Adicione validação customizada
    if (nome.length() > 255) {
        throw new IllegalArgumentException("Nome muito longo");
    }
    
    if (quantidade > 10000) {
        throw new IllegalArgumentException("Quantidade muito alta");
    }
    
    // ... resto do código ...
}
```

### Aumentar Tamanho Máximo de Upload

```properties
# application.properties
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

---

## 📋 Checklist de Implementação

- ✅ Dependência Apache POI adicionada (pom.xml)
- ✅ ExcelImportService criado
- ✅ Endpoints POST adicionados em ProdutoController
- ✅ ProdutoRepository interface criada
- ✅ ViewController criado para servir HTML
- ✅ Funções JavaScript adicionadas (script.js)
- ✅ application.properties configurado
- ✅ Main.java atualizado com @SpringBootApplication
- ✅ Arquivo Excel de exemplo criado (produtos_exemplo.xlsx)
- ✅ Scripts de execução (run.bat, run.ps1)
- ✅ Documentação completa

---

## 📚 Referências

### Apache POI
- Documentação: https://poi.apache.org/
- Células: `Cell`, `Row`, `Sheet`, `Workbook`
- Tipos: `CellType.STRING`, `CellType.NUMERIC`, etc.

### Spring Boot
- Validação: `@Valid`, `@NotBlank`, `@Min`, `@NotNull`
- Endpoints: `@RestController`, `@PostMapping`, `@RequestParam`
- MultipartFile: `org.springframework.web.multipart.MultipartFile`

### Padrões Usados
- **DTO Pattern**: Separação entre dados de entrada/saída
- **Service Layer**: Lógica de negócio centralizada
- **Repository Pattern**: Acesso a dados abstrato
- **Factory Pattern**: Conversão de entidades para DTOs

---

## 🎓 Aprendizados

1. **Leitura de Excel com POI**
   - Navegação entre sheets, linhas e colunas
   - Tratamento de diferentes tipos de célula
   - Conversão robusta de tipos

2. **Validação de Dados**
   - Validação em múltiplas camadas
   - Tratamento de exceções
   - Feedback ao usuário

3. **Integração Frontend-Backend**
   - Upload de arquivo via FormData
   - Endpoints RESTful
   - Resposta JSON estruturada

4. **Boas Práticas**
   - Separação de responsabilidades
   - Tratamento de erros
   - Logging adequado
   - Documentação clara

---

## 🚦 Próximas Melhorias

```
Curto Prazo:
□ Validação mais rigorosa (email, CNPJ, etc)
□ Suporte a múltiplas abas
□ Importação em lote
□ Histórico de importações

Médio Prazo:
□ Exportar para Excel
□ Mapeamento dinâmico de colunas
□ Importação assíncrona (grandes arquivos)
□ Dashboard com gráficos

Longo Prazo:
□ Autenticação e autorização
□ Backup automático
□ API WebSocket (real-time)
□ Cache distribuído (Redis)
```

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs da aplicação
2. Consulte o arquivo README.md
3. Teste com arquivo de exemplo (produtos_exemplo.xlsx)
4. Valide o formato do arquivo Excel
5. Verifique a versão do Java (17+)

---

## 📝 Notas

- A primeira linha do Excel é sempre ignorada (cabeçalho)
- Linhas vazias são automaticamente puladas
- Produtos com dados inválidos são registrados no log
- Cada importação é independente (sem deduplicação)
- Banco H2 é em memória (dados perdidos ao reiniciar)

---

**Versão:** 1.0.0  
**Data:** Novembro 2025  
**Status:** ✅ Produção Pronto
