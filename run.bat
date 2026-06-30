@echo off
REM Script de teste para validar a importacao de Excel
REM Pressione qualquer tecla para continuar

echo.
echo ========================================
echo Teste de Importacao de Excel - RealCar
echo ========================================
echo.

echo [1] Compilando o projeto...
call mvn clean install -q
if %errorlevel% neq 0 (
    echo ERRO: Falha na compilacao
    pause
    exit /b 1
)
echo [OK] Projeto compilado com sucesso

echo.
echo [2] Iniciando a aplicacao...
start cmd /k mvn spring-boot:run

echo.
echo [3] Aguardando a aplicacao iniciar (10 segundos)...
timeout /t 10

echo.
echo [4] Testando endpoint de produtos...
curl -s http://localhost:8080/produtos
echo.

echo.
echo [5] A aplicacao esta em execucao!
echo.
echo    Acesse: http://localhost:8080
echo.
echo Para importar o arquivo de exemplo:
echo    - Clique em "Importar" na secao "Importar Planilha Excel"
echo    - Selecione o arquivo: produtos_exemplo.xlsx
echo    - Confirme a importacao
echo.
echo Arquivo de exemplo criado: produtos_exemplo.xlsx
echo.
echo Pressione CTRL+C na janela da aplicacao para parar
pause
