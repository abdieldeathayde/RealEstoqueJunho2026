#!/usr/bin/env pwsh
# Script para compilar e executar a aplicacao RealCar

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Teste de Importacao de Excel - RealCar" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Compilar
Write-Host "[1] Compilando o projeto..." -ForegroundColor Yellow
mvn clean install -q

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha na compilacao" -ForegroundColor Red
    Read-Host "Pressione ENTER para sair"
    exit 1
}

Write-Host "[OK] Projeto compilado com sucesso" -ForegroundColor Green
Write-Host ""

# 2. Executar
Write-Host "[2] Iniciando a aplicacao Spring Boot..." -ForegroundColor Yellow
Write-Host "    (Uma janela sera aberta...)" -ForegroundColor Gray

# Usar Start-Process para manter o PowerShell responsivo
$processArgs = @(
    "spring-boot:run"
)

Start-Process -FilePath "mvn" -ArgumentList $processArgs -NoNewWindow

Write-Host ""
Write-Host "[3] Aguardando 10 segundos para a aplicacao iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "[4] Testando conexao..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/produtos" -Method Get -ErrorAction Stop
    Write-Host "[OK] Aplicacao respondendo corretamente" -ForegroundColor Green
} catch {
    Write-Host "[AVISO] Aplicacao ainda nao respondeu (pode estar inicializando)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "APLICACAO EM EXECUCAO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "URL da aplicacao: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para importar o arquivo de exemplo:" -ForegroundColor Yellow
Write-Host "  1. Acesse http://localhost:8080" -ForegroundColor Gray
Write-Host "  2. Clique em 'Importar' na secao 'Importar Planilha Excel'" -ForegroundColor Gray
Write-Host "  3. Selecione o arquivo: produtos_exemplo.xlsx" -ForegroundColor Gray
Write-Host "  4. Confirme a importacao" -ForegroundColor Gray
Write-Host ""
Write-Host "Arquivo de exemplo: produtos_exemplo.xlsx" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione CTRL+C para parar a aplicacao" -ForegroundColor Yellow
Write-Host ""

# Manter o script aberto
Read-Host "Pressione ENTER para abrir um novo terminal"
Start-Process powershell
