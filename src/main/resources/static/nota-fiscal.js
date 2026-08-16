// Seletores de Navegação e Telas
const telaListagem = document.getElementById('tela-listagem');
const telaFormulario = document.getElementById('tela-formulario');
const btnNovaNota = document.getElementById('btnNovaNota');
const btnVoltar = document.getElementById('btnVoltar');

// Elementos do Formulário
const form = document.getElementById('formNotaFiscal');
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const btnAtualizarLista = document.getElementById('btnAtualizarLista');
const btnSalvar = document.getElementById('btnSalvar');
const tituloFormulario = document.getElementById('tituloFormulario');
const subtituloFormulario = document.getElementById('subtituloFormulario');

// URLs da API
const API_URL = "http://localhost:8080/api/notas-fiscais";

// Variável de controle do estado atual ('CRIAR', 'EDITAR', 'VISUALIZAR')
let modoFormulario = 'CRIAR';

function numero(valor) {
    return valor === "" || valor === null || valor === undefined ? null : Number(valor);
}

// Alternar entre telas da aplicação
function exibirTelaListagem() {
    if (telaListagem) telaListagem.classList.remove('hidden');
    if (telaFormulario) telaFormulario.classList.add('hidden');
    carregarNotas();
}

function exibirTelaFormulario(modo = 'CRIAR') {
    modoFormulario = modo;
    if (telaListagem) telaListagem.classList.add('hidden');
    if (telaFormulario) telaFormulario.classList.remove('hidden');

    configurarModoFormulario();
}

// Controla comportamento de inputs e textos conforme ação do usuário
function configurarModoFormulario() {
    if (!form) return;
    const inputs = form.querySelectorAll('.dynamic-input, input, select');

    if (modoFormulario === 'VISUALIZAR') {
        if (tituloFormulario) tituloFormulario.innerText = "Visualização de Nota Fiscal";
        if (subtituloFormulario) subtituloFormulario.innerText = "Modo de leitura. Os dados não podem ser modificados.";
        if (btnSalvar) btnSalvar.classList.add('hidden');
        if (btnAdicionarItem) btnAdicionarItem.classList.add('hidden');
        inputs.forEach(i => i.setAttribute('disabled', 'true'));
        document.querySelectorAll('.col-acao-item').forEach(el => el.classList.add('hidden'));
    } else {
        if (btnSalvar) btnSalvar.classList.remove('hidden');
        if (btnAdicionarItem) btnAdicionarItem.classList.remove('hidden');
        inputs.forEach(i => i.removeAttribute('disabled'));
        document.querySelectorAll('.col-acao-item').forEach(el => el.classList.remove('hidden'));

        if (modoFormulario === 'EDITAR') {
            if (tituloFormulario) tituloFormulario.innerText = "Editar Nota Fiscal";
            if (subtituloFormulario) subtituloFormulario.innerText = "Modificando registros estruturais da Nota Fiscal.";
            if (btnSalvar) btnSalvar.innerText = "Atualizar Nota Fiscal";
        } else {
            if (tituloFormulario) tituloFormulario.innerText = "Nova Nota Fiscal";
            if (subtituloFormulario) subtituloFormulario.innerText = "Insira os dados correspondentes para faturamento e registro.";
            if (btnSalvar) btnSalvar.innerText = "Salvar Nota Fiscal";
        }
    }
}

// Adiciona uma linha de item dinâmica na tabela do formulário
function criarLinhaItem(item = {}) {
    const tbody = document.querySelector("#tabelaItens tbody");
    if (!tbody) return;

    // Mapeamento seguro das propriedades (cobre DTO de resposta e Entidade)
    const codigo = item.codigo || item.codigoProduto || item.codigoProduto || '';
    const descricao = item.descricao || item.descricao || '';
    const ncm = item.ncm || item.ncmSh || '';
    const cst = item.cst || '';
    const cfop = item.cfop || '';
    const unidade = item.unidade || '';
    const quantidade = item.quantidade !== undefined && item.quantidade !== null ? item.quantidade : 1;
    const valorUnitario = item.valorUnitario !== undefined && item.valorUnitario !== null ? item.valorUnitario : 0;
    const valorTotal = item.valorTotal !== undefined && item.valorTotal !== null ? item.valorTotal : 0;

    const tr = document.createElement("tr");
    tr.className = "hover:bg-slate-50 transition-colors item-row";

    tr.innerHTML = `
        <td class="p-2"><input type="text" name="codigo" value="${codigo}" class="w-full text-xs border border-slate-300 rounded p-1"></td>
        <td class="p-2"><input type="text" name="descricao" value="${descricao}" class="w-full text-xs border border-slate-300 rounded p-1"></td>
        <td class="p-2"><input type="text" name="ncm" value="${ncm}" class="w-full text-xs border border-slate-300 rounded p-1"></td>
        <td class="p-2"><input type="text" name="cst" value="${cst}" class="w-full text-xs border border-slate-300 rounded p-1"></td>
        <td class="p-2"><input type="text" name="cfop" value="${cfop}" class="w-full text-xs border border-slate-300 rounded p-1"></td>
        <td class="p-2"><input type="text" name="unidade" value="${unidade}" class="w-full text-xs border border-slate-300 rounded p-1"></td>
        <td class="p-2"><input type="number" step="0.001" name="quantidade" value="${quantidade}" class="w-full text-xs border border-slate-300 rounded p-1 qtd-input"></td>
        <td class="p-2"><input type="number" step="0.01" name="valorUnitario" value="${valorUnitario}" class="w-full text-xs border border-slate-300 rounded p-1 vl-unit-input"></td>
        <td class="p-2"><input type="number" step="0.01" name="valorTotal" value="${valorTotal}" class="w-full text-xs border border-slate-300 rounded p-1 bg-slate-100 vl-total-input" readonly></td>
        <td class="p-2 text-center col-acao-item">
            <button type="button" class="btn-remover-item text-red-500 hover:text-red-700 font-bold p-1">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;

    // Listeners para recálculo automático de totais
    const qtdInput = tr.querySelector('.qtd-input');
    const unitInput = tr.querySelector('.vl-unit-input');
    const btnRemover = tr.querySelector('.btn-remover-item');

    if (qtdInput) qtdInput.addEventListener('input', () => calcularTotalItem(tr));
    if (unitInput) unitInput.addEventListener('input', () => calcularTotalItem(tr));
    if (btnRemover) {
        btnRemover.addEventListener('click', () => {
            tr.remove();
            atualizarTotaisNota();
        });
    }

    tbody.appendChild(tr);
    configurarModoFormulario();
}

// Busca por ID primeiro. Se não achar, busca pelo atributo name=""
function setCampo(nomeOuId, valor) {
    if (valor === null || valor === undefined) valor = "";

    let el = document.getElementById(nomeOuId);
    if (!el && form) {
        el = form.querySelector(`[name="${nomeOuId}"]`);
    }

    if (el) {
        if (el.type === 'datetime-local' && typeof valor === 'string' && valor.length >= 16) {
            el.value = valor.substring(0, 16);
        } else {
            el.value = valor;
        }
    } else {
        console.warn(`[Aviso] Input não localizado no HTML: id ou name = "${nomeOuId}"`);
    }
}

function preencherFormulario(nota) {
    console.log("Preenchendo formulário com a Nota:", nota);

    setCampo("notaId", nota.id);

    // 1. DADOS GERAIS DA NOTA
    setCampo("naturezaOperacao", nota.naturezaOperacao);
    setCampo("numero", nota.numero);
    setCampo("serie", nota.serie);
    setCampo("dataHoraEmissao", nota.dataHoraEmissao);

    // 2. DADOS DO EMITENTE / DESTINATÁRIO
    setCampo("razaoSocial", nota.razaoSocial);
    setCampo("cnpjCpf", nota.cnpjCpf);
    setCampo("inscricaoEstadual", nota.inscricaoEstadual);
    setCampo("inscricaoEstadualSt", nota.inscricaoEstadualSt);
    setCampo("fone", nota.fone);
    setCampo("endereco", nota.endereco);
    setCampo("bairro", nota.bairro);
    setCampo("cep", nota.cep);
    setCampo("municipio", nota.municipio);
    setCampo("uf", nota.uf);

    // 4. CÁLCULOS DE IMPOSTOS E TOTAIS
    setCampo("baseCalculoIcms", nota.baseCalculoIcms);
    setCampo("valorIcms", nota.valorIcms);
    setCampo("baseCalculoIcmsSt", nota.baseCalculoIcmsSt);
    setCampo("valorIcmsSt", nota.valorIcmsSt);
    setCampo("valorFrete", nota.valorFrete);
    setCampo("valorSeguro", nota.valorSeguro);
    setCampo("desconto", nota.desconto);
    setCampo("valorIpi", nota.valorIpi);
    setCampo("valorTotalProdutos", nota.valorTotalProdutos);
    setCampo("valorTotalNota", nota.valorTotalNota);

    // 3. DADOS DOS PRODUTOS
    const tbody = document.querySelector("#tabelaItens tbody");
    if (tbody) tbody.innerHTML = "";

    const itens = nota.itens || [];
    console.log("Itens para renderizar na tabela:", itens);

    if (Array.isArray(itens) && itens.length > 0) {
        itens.forEach(item => criarLinhaItem(item));
    } else {
        criarLinhaItem();
    }

    atualizarTotaisNota();
}

function montarNotaFiscal() {
    if (!form) return {};
    const campos = form.elements;

    return {
        numero: campos.numero?.value || '',
        serie: campos.serie?.value || '',
        naturezaOperacao: campos.naturezaOperacao?.value || '',
        dataHoraEmissao: campos.dataHoraEmissao?.value || '',
        razaoSocial: campos.razaoSocial?.value || '',
        cnpjCpf: campos.cnpjCpf?.value || '',
        inscricaoEstadual: campos.inscricaoEstadual?.value || '',
        inscricaoEstadualSt: campos.inscricaoEstadualSt?.value || '',
        endereco: campos.endereco?.value || '',
        bairro: campos.bairro?.value || '',
        cep: campos.cep?.value || '',
        municipio: campos.municipio?.value || '',
        uf: campos.uf?.value || '',
        fone: campos.fone?.value || '',
        baseCalculoIcms: numero(campos.baseCalculoIcms?.value),
        valorIcms: numero(campos.valorIcms?.value),
        baseCalculoIcmsSt: numero(campos.baseCalculoIcmsSt?.value),
        valorIcmsSt: numero(campos.valorIcmsSt?.value),
        valorFrete: numero(campos.valorFrete?.value),
        valorSeguro: numero(campos.valorSeguro?.value),
        desconto: numero(campos.desconto?.value),
        valorIpi: numero(campos.valorIpi?.value),
        valorTotalProdutos: numero(campos.valorTotalProdutos?.value),
        valorTotalNota: numero(campos.valorTotalNota?.value),
        itens: obterItens()
    };
}

function obterItens() {
    return [...document.querySelectorAll("#tabelaItens tbody tr.item-row")]
        .map(row => ({
            codigo: row.querySelector('[name="codigo"]')?.value || '',
            descricao: row.querySelector('[name="descricao"]')?.value || '',
            ncm: row.querySelector('[name="ncm"]')?.value || '',
            cst: row.querySelector('[name="cst"]')?.value || '',
            cfop: row.querySelector('[name="cfop"]')?.value || '',
            unidade: row.querySelector('[name="unidade"]')?.value || '',
            quantidade: numero(row.querySelector('[name="quantidade"]')?.value),
            valorUnitario: numero(row.querySelector('[name="valorUnitario"]')?.value),
            valorTotal: numero(row.querySelector('[name="valorTotal"]')?.value)
        }))
        .filter(item => item.descricao && item.descricao.trim() !== "");
}

// Cálculos dinâmicos
function calcularTotalItem(row) {
    if (!row) return;

    const qtd = parseFloat(row.querySelector('[name="quantidade"]')?.value) || 0;
    const valUnit = parseFloat(row.querySelector('[name="valorUnitario"]')?.value) || 0;
    const totalInput = row.querySelector('[name="valorTotal"]');

    if (totalInput) {
        totalInput.value = (qtd * valUnit).toFixed(2);
    }
    atualizarTotaisNota();
}

function atualizarTotaisNota() {
    let totalProdutos = 0;
    document.querySelectorAll('#tabelaItens tbody [name="valorTotal"]').forEach(input => {
        totalProdutos += parseFloat(input.value) || 0;
    });

    const inputTotalProdutos = form ? form.querySelector('[name="valorTotalProdutos"]') : null;
    if (inputTotalProdutos) inputTotalProdutos.value = totalProdutos.toFixed(2);

    const frete = parseFloat(form?.querySelector('[name="valorFrete"]')?.value) || 0;
    const seguro = parseFloat(form?.querySelector('[name="valorSeguro"]')?.value) || 0;
    const desconto = parseFloat(form?.querySelector('[name="desconto"]')?.value) || 0;
    const ipi = parseFloat(form?.querySelector('[name="valorIpi"]')?.value) || 0;

    const totalNota = (totalProdutos + frete + seguro + ipi) - desconto;
    const inputTotalNota = form ? form.querySelector('[name="valorTotalNota"]') : null;
    if (inputTotalNota) inputTotalNota.value = totalNota.toFixed(2);
}

// Integração com a API - Listagem (GET)
// URLs da API
const token = localStorage.getItem("token");
console.log("Token:", token);
// Integração com a API - Listagem (GET)
async function carregarNotas() {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("URL da requisição:", API_URL);
        console.log("Status:", response.status);
        console.log(
            "Content-Type:",
            response.headers.get("content-type")
        );

        const texto = await response.text();

        console.log("Resposta da API:", texto);

        if (!response.ok) {
            throw new Error(
                `Erro HTTP ${response.status}: ${
                    texto || "resposta vazia"
                }`
            );
        }

        if (!texto.trim()) {
            console.warn("A API retornou uma resposta vazia.");
            preencherTabelaListagem([]);
            return;
        }

        let notas;

        try {
            notas = JSON.parse(texto);
        } catch (error) {
            console.error(
                "Resposta não é um JSON válido:",
                texto
            );

            throw new Error(
                "A API retornou conteúdo que não é JSON válido."
            );
        }

        console.log("Notas carregadas:", notas);

        preencherTabelaListagem(notas);

    } catch (error) {
        console.error(
            "❌ Erro ao carregar notas:",
            error
        );

        preencherTabelaListagem([]);
    }
}

function preencherTabelaListagem(notas) {
    const tbody = document.querySelector("#tabelaNotas tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!Array.isArray(notas) || notas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-3 text-center text-slate-400">Nenhuma nota fiscal cadastrada.</td></tr>`;
        return;
    }

    notas.forEach(nota => {
        tbody.insertAdjacentHTML("beforeend", `
            <tr class="border-b border-slate-100 hover:bg-slate-50 transition-colors text-slate-700">
                <td class="p-3 font-medium text-slate-900">${nota.id}</td>
                <td class="p-3">${nota.numero || '-'}</td>
                <td class="p-3">${nota.serie || '-'}</td>
                <td class="p-3">${nota.razaoSocial || '-'}</td>
                <td class="p-3 font-semibold text-slate-900">R$ ${(nota.valorTotalNota ?? 0).toFixed(2)}</td>
                <td class="p-3 space-x-1 text-center">
                    <button type="button" onclick="buscarNotaFiscal(${nota.id}, 'VISUALIZAR')" class="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-blue-200">
                        Ver
                    </button>
                    <button type="button" onclick="buscarNotaFiscal(${nota.id}, 'EDITAR')" class="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-amber-200">
                        Editar
                    </button>
                    <button type="button" onclick="excluirNota(${nota.id})" class="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-red-200">
                        Excluir
                    </button>
                </td>
            </tr>
        `);
    });
}

async function buscarNotaFiscal(id, modo = 'VISUALIZAR') {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Sessão expirada. Faça login novamente.");
            return;
        }

        console.log("Buscando nota fiscal:", id);
        console.log("Modo:", modo);

        const response = await fetch(`${API_URL}/${id}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("Status:", response.status);

        const texto = await response.text();

        console.log("Resposta:", texto);

        if (!response.ok) {
            throw new Error(
                `Erro HTTP ${response.status}: ${texto || "resposta vazia"}`
            );
        }

        if (!texto.trim()) {
            throw new Error("A API retornou uma resposta vazia.");
        }

        const nota = JSON.parse(texto);

        console.log("Nota fiscal encontrada:", nota);

        // Guarda o modo atual
        modoFormulario = modo;

        // Preenche o formulário
        preencherFormulario(nota);

        // Exibe a tela
        exibirTelaFormulario(modo);

    } catch (error) {
        console.error("❌ Erro ao buscar nota fiscal:", error);

        alert(
            `Não foi possível carregar a nota fiscal.\n\n${error.message}`
        );
    }
}

// API - Remoção (DELETE)
async function excluirNota(id) {

    if (!confirm(
        "Deseja realmente excluir esta nota fiscal permanentemente?"
    )) {
        return;
    }

    try {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Sessão expirada. Faça login novamente.");
            return;
        }

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        console.log("DELETE status:", response.status);

        if (response.ok) {

            alert("Nota fiscal excluída com sucesso!");

            await carregarNotas();

        } else {

            const erro = await response.text();

            console.error("Erro ao excluir:", erro);

            alert(
                `Não foi possível excluir a nota fiscal.\n\n` +
                `HTTP ${response.status}\n${erro}`
            );
        }

    } catch (error) {

        console.error("Erro ao deletar:", error);

        alert("Erro de conexão com o backend.");
    }
}

// Envio do formulário (POST / PUT)
if (form) {

    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Sessão expirada. Faça login novamente.");
            return;
        }

        const notaFiscal = montarNotaFiscal();

        const idInput = document.getElementById('notaId');
        const id = idInput ? idInput.value : '';

        // Validação
        if (
            !notaFiscal.numero ||
            !notaFiscal.razaoSocial ||
            notaFiscal.itens.length === 0
        ) {
            alert(
                "Campos obrigatórios ausentes: " +
                "Verifique o Número, a Razão Social " +
                "e adicione ao menos 1 Item com descrição."
            );
            return;
        }

        const urlFinal =
            modoFormulario === 'EDITAR'
                ? `${API_URL}/${id}`
                : API_URL;

        const metodoHttp =
            modoFormulario === 'EDITAR'
                ? 'PUT'
                : 'POST';

        console.log("Método:", metodoHttp);
        console.log("URL:", urlFinal);
        console.log("Dados:", notaFiscal);

        try {

            const response = await fetch(urlFinal, {

                method: metodoHttp,

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify(notaFiscal)
            });

            console.log(
                "Status da gravação:",
                response.status
            );

            const texto = await response.text();

            console.log(
                "Resposta do servidor:",
                texto
            );

            if (response.ok) {

                alert(
                    modoFormulario === 'EDITAR'
                        ? "Nota Fiscal atualizada com sucesso!"
                        : "Nota Fiscal criada com sucesso!"
                );

                exibirTelaListagem();

            } else {

                alert(
                    `Erro do servidor.\n\n` +
                    `HTTP ${response.status}\n` +
                    `${texto || "Resposta vazia"}`
                );
            }

        } catch (error) {

            console.error(
                "Erro na requisição:",
                error
            );

            alert(
                "Erro de conexão com o backend."
            );
        }
    });
}

// Listeners de Eventos Globais
if (btnNovaNota) {
    btnNovaNota.addEventListener('click', () => {
        if (form) form.reset();
        const notaIdInput = document.getElementById('notaId');
        if (notaIdInput) notaIdInput.value = '';

        const tbody = document.querySelector("#tabelaItens tbody");
        if (tbody) tbody.innerHTML = '';

        exibirTelaFormulario('CRIAR');
        criarLinhaItem();
    });
}

if (btnVoltar) {
    btnVoltar.addEventListener('click', exibirTelaListagem);
}

if (btnAdicionarItem) {
    btnAdicionarItem.addEventListener('click', () => criarLinhaItem());
}

if (btnAtualizarLista) {
    btnAtualizarLista.addEventListener('click', carregarNotas);
}

['valorFrete', 'valorSeguro', 'desconto', 'valorIpi'].forEach(name => {
    const input = form ? form.querySelector(`[name="${name}"]`) : null;
    if (input) input.addEventListener('input', atualizarTotaisNota);
});

// Inicialização da SPA
window.addEventListener('DOMContentLoaded', () => {
    exibirTelaListagem();
});