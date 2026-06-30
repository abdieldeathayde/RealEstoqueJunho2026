# Estoque RealCar - Sistema de Gestão de Estoque

Sistema web para gerenciamento de produtos com importação de dados via Excel (XLSX).

## Funcionalidades

- ✅ Importar produtos de arquivo Excel (.xlsx)
- ✅ Visualizar preview antes de importar
- ✅ CRUD completo de produtos
- ✅ Buscar e filtrar produtos
- ✅ Filtro de baixo estoque
- ✅ Paginação de resultados
- ✅ Interface web responsiva

## Arquitetura

### Backend - Java Spring Boot

#### Camadas:
- **Controller**: `ProdutoController` - Endpoints REST
- **Service**: `ProdutoService`, `ExcelImportService` - Lógica de negócio
- **Repository**: `ProdutoRepository` - Acesso a dados
- **Entity**: `Produto` - Modelo de dados
- **DTO**: `ProdutoRequestDTO`, `ProdutoResponseDTO` - Transfer Objects

#### Tecnologias:
- Spring Boot 3.1.5
- Spring Data JPA
- H2 Database
- Apache POI 5.2.3 (leitura de Excel)
- Jakarta Validation
- Lombok

### Frontend

- HTML5 + Tailwind CSS
- JavaScript vanilla
- Responsive design
- Font Awesome icons

## Requisitos

- Java 17+
- Maven 3.6+
- Navegador moderno

## Instalação e Execução

### 1. Clonar ou acessar o repositório
```bash
cd realcar
```

### 2. Instalar dependências Maven
```bash
mvn clean install
```

### 3. Executar a aplicação
```bash
mvn spring-boot:run
```

ou

```bash
mvn clean package
java -jar target/realcar-1.0-SNAPSHOT.jar
```

### 4. Acessar a aplicação
Abra seu navegador e acesse:
```
http://localhost:8080
```

## Como Importar Produtos via Excel

### Formato do Arquivo Excel

O arquivo deve estar no formato `.xlsx` com a seguinte estrutura:

| Nome | Quantidade | Preço |
|------|-----------|-------|
| Notebook Dell | 15 | 4299.99 |
| Mouse Wireless | 42 | 129.90 |
| Teclado RGB | 8 | 349.90 |

**Requisitos:**
- Primeira linha: cabeçalho (será ignorada)
- Coluna A: Nome do produto (texto)
- Coluna B: Quantidade (número inteiro)
- Coluna C: Preço (número decimal)

### Passos para Importar

1. **Na interface web**, localize a seção "Importar Planilha Excel"
2. **Selecione o arquivo** .xlsx com os dados
3. **Clique em "Importar"**
4. **Revise o preview** dos produtos a serem importados
5. **Confirme a importação**
6. Os produtos serão salvos automaticamente no banco de dados

## Endpoints da API

### Produtos

#### GET `/produtos`
Lista todos os produtos

**Response:**
```json
[
  {
    "id": 1,
    "nome": "Notebook Dell",
    "quantidade": 15,
    "preco": 4299.99
  }
]
```

#### GET `/produtos/{id}`
Busca um produto específico

#### POST `/produtos`
Cria um novo produto

**Request:**
```json
{
  "nome": "Novo Produto",
  "quantidade": 10,
  "preco": 199.90
}
```

#### PUT `/produtos/{id}`
Atualiza um produto existente

#### DELETE `/produtos/{id}`
Deleta um produto

### Importação

#### POST `/produtos/importar/visualizar`
Visualiza produtos antes de importar

**Request (multipart/form-data):**
- `file`: arquivo Excel

**Response:**
```json
{
  "total": 5,
  "mensagem": "Produtos prontos para importar",
  "produtos": [...]
}
```

#### POST `/produtos/importar`
Importa e salva produtos no banco de dados

**Request (multipart/form-data):**
- `file`: arquivo Excel

**Response:**
```json
{
  "sucesso": true,
  "totalImportado": 5,
  "mensagem": "5 produto(s) importado(s) com sucesso"
}
```

## Estrutura de Pastas

```
realcar/
├── src/
│   ├── main/
│   │   ├── java/com/estoque/realcar/
│   │   │   ├── controller/
│   │   │   │   ├── ProdutoController.java
│   │   │   │   └── ViewController.java
│   │   │   ├── service/
│   │   │   │   ├── ProdutoService.java
│   │   │   │   ├── ExcelImportService.java
│   │   │   │   └── Produto.java
│   │   │   ├── dto/
│   │   │   │   ├── ProdutoRequestDTO.java
│   │   │   │   └── ProdutoResponseDTO.java
│   │   │   ├── repository/
│   │   │   │   └── ProdutoRepository.java
│   │   │   └── Main.java
│   │   └── resources/
│   │       ├── templates/
│   │       │   └── index.html
│   │       ├── static/
│   │       │   ├── script.js
│   │       │   └── style.css
│   │       └── application.properties
│   └── test/
├── pom.xml
├── produtos_exemplo.xlsx
└── README.md
```

## Tratamento de Erros

O sistema valida:
- ✅ Arquivo vazio
- ✅ Formato de arquivo inválido
- ✅ Dados faltantes ou inválidos
- ✅ Valores numéricos incorretos
- ✅ Linhas vazias na planilha

## Características do ExcelImportService

### Métodos Principais

- **importarDePlanilha()**: Lê arquivo e retorna lista de produtos
- **importarESalvar()**: Importa e salva no banco de dados
- **getCellStringValue()**: Extrai texto de célula (suporta múltiplos tipos)
- **getCellIntValue()**: Extrai inteiro de célula
- **getCellDoubleValue()**: Extrai decimal de célula
- **isRowEmpty()**: Verifica se linha está vazia
- **isExcelFile()**: Valida extensão do arquivo

### Suporte a Diferentes Formatos

O serviço suporta valores em diferentes formatos:
- Números como números (padrão)
- Números como texto
- Decimais com vírgula ou ponto
- Valores vazios ou nulos

## Desenvolvimento

### Adicionar Novas Validações

Edit `ExcelImportService.java` - Método `extrairProdutoDaLinha()`

### Customizar Colunas

Edit `ExcelImportService.java` - Método `extrairProdutoDaLinha()`

Altere os índices das colunas:
```java
Cell nomeCell = row.getCell(0);      // Coluna A
Cell quantidadeCell = row.getCell(1); // Coluna B
Cell precoCell = row.getCell(2);     // Coluna C
```

## Exemplo de Uso com cURL

```bash
# Visualizar importação
curl -F "file=@produtos.xlsx" http://localhost:8080/produtos/importar/visualizar

# Realizar importação
curl -F "file=@produtos.xlsx" http://localhost:8080/produtos/importar

# Listar produtos
curl http://localhost:8080/produtos

# Criar produto
curl -X POST http://localhost:8080/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Novo","quantidade":5,"preco":99.90}'
```

## Configurações

### Arquivo application.properties

- `server.port=8080`: Porta da aplicação
- `spring.jpa.hibernate.ddl-auto=create-drop`: Cria/recria tabelas ao iniciar
- `spring.servlet.multipart.max-file-size=10MB`: Tamanho máximo de upload

Customize conforme necessário em `src/main/resources/application.properties`

## Troubleshooting

### Erro ao importar Excel
- Verifique se o arquivo está no formato .xlsx
- Confirme que as colunas estão na ordem correta
- Valide os dados numéricos

### Porta 8080 já em uso
```bash
# Alterative no application.properties
server.port=8081
```

### Banco de dados não inicializa
- Verify Java 17+ está instalado
- Limpe e rebuild: `mvn clean install`

## Próximas Melhorias

- [ ] Suporte para múltiplas abas do Excel
- [ ] Importação assíncrona para grandes arquivos
- [ ] Exportar dados para Excel
- [ ] Validação customizável por tipo de produto
- [ ] Histórico de importações
- [ ] Rollback de importação com erros
- [ ] Dashboard com gráficos
- [ ] Autenticação e autorização
- [ ] Auditoria de alterações

## Licença

MIT License

## Suporte

Para dúvidas ou problemas, abra uma issue ou entre em contato.
