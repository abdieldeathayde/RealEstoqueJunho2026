// Seletores de Navegação e Telas
const telaListagem = document.getElementById('tela-listagem');
const telaFormulario = document.getElementById('tela-formulario');
const btnNovaNota = document.getElementById('btnNovaNota');
const btnVoltar = document.getElementById('btnVoltar');

// Elementos do Formulário
const form = document.getElementById('formNotaFiscal');
const tabelaItens = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
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
    return valor === "" ? null : Number(valor);
}

// Alternar entre telas da aplicação
function exibirTelaListagem() {
    telaListagem.classList.remove('hidden');
    telaFormulario.classList.add('hidden');
    carregarNotas();
}

function exibirTelaFormulario(modo = 'CRIAR') {
    modoFormulario = modo;
    telaListagem.classList.add('hidden');
    telaFormulario.classList.remove('hidden');

    // Configura a acessibilidade das regras de negócio visuais baseado no modo
    configurarModoFormulario();
}

// Controla comportamento de inputs e textos conforme ação do usuário
function configurarModoFormulario() {
    const inputs = form.querySelectorAll('.dynamic-input');

    if (modoFormulario === 'VISUALIZAR') {
        tituloFormulario.innerText = "Visualização de Nota Fiscal";
        subtituloFormulario.innerText = "Modo de leitura. Os dados não podem ser modificados.";
        btnSalvar.classList.add('hidden');
        btnAdicionarItem.classList.add('hidden');
        inputs.forEach(i => i.setAttribute('disabled', 'true'));
        document.querySelectorAll('.col-acao-item').forEach(el => el.classList.add('hidden'));
    } else {
        btnSalvar.classList.remove('hidden');
        btnAdicionarItem.classList.remove('hidden');
        inputs.forEach(i => i.removeAttribute('disabled'));
        document.querySelectorAll('.col-acao-item').forEach(el => el.classList.remove('hidden'));

        if (modoFormulario === 'EDITAR') {
            tituloFormulario.innerText = "Editar Nota Fiscal";
            subtituloFormulario.innerText = "Modificando registros estruturais da Nota Fiscal.";
            btnSalvar.innerText = "Atualizar Nota Fiscal";
        } else {
            tituloFormulario.innerText = "Nova Nota Fiscal";
            subtituloFormulario.innerText = "Insira os dados correspondentes para faturamento e registro.";
            btnSalvar.innerText = "Salvar Nota Fiscal";
        }
    }
}

// Adiciona uma linha de item dinâmica na tabela do formulário
function criarLinhaItem(dadosItem = null) {
    const row = tabelaItens.insertRow();
    row.className = "hover:bg-slate-50 transition-colors input-item-row";

    const isReadonly = modoFormulario === 'VISUALIZAR' ? 'disabled' : '';
    const classeOcultaAcao = modoFormulario === 'VISUALIZAR' ? 'hidden' : '';

    row.innerHTML = `
        <td class="p-2"><input type="text" class="w-16 border rounded p-1" data-field="codigo" value="${dadosItem?.codigo || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="text" class="w-full border rounded p-1" data-field="descricao" value="${dadosItem?.descricao || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="text" class="w-16 border rounded p-1" data-field="ncm" value="${dadosItem?.ncm || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="text" class="w-12 border rounded p-1" data-field="cst" value="${dadosItem?.cst || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="text" class="w-12 border rounded p-1" data-field="cfop" value="${dadosItem?.cfop || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="text" class="w-10 border rounded p-1" data-field="unidade" value="${dadosItem?.unidade || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="number" class="w-14 border rounded p-1" data-field="quantidade" oninput="calcularTotalItem(this)" value="${dadosItem?.quantidade || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="number" step="0.01" class="w-20 border rounded p-1" data-field="valorUnitario" oninput="calcularTotalItem(this)" value="${dadosItem?.valorUnitario || ''}" ${isReadonly}></td>
        <td class="p-2"><input type="number" step="0.01" class="w-20 border bg-slate-50 rounded p-1 font-medium" data-field="valorTotal" value="${dadosItem?.valorTotal || ''}" readonly></td>
        <td class="p-2 text-center col-acao-item ${classeOcultaAcao}"><button type="button" onclick="this.closest('tr').remove(); atualizarTotaisNota();" class="text-red-500 hover:text-red-700 font-semibold">✕</button></td>
    `;
}

// Mapeamento de dados do formulário para envio ou população
function preencherFormulario(nota) {
    form.querySelector('#notaId').value = nota.id || '';
    form.elements.numero.value = nota.numero || '';
    form.elements.serie.value = nota.serie || '';
    form.elements.naturezaOperacao.value = nota.naturezaOperacao || '';
    form.elements.dataHoraEmissao.value = nota.dataHoraEmissao || '';
    form.elements.razaoSocial.value = nota.razaoSocial || '';
    form.elements.cnpjCpf.value = nota.cnpjCpf || '';
    form.elements.inscricaoEstadual.value = nota.inscricaoEstadual || '';
    form.elements.inscricaoEstadualSt.value = nota.inscricaoEstadualSt || '';
    form.elements.endereco.value = nota.endereco || '';
    form.elements.bairro.value = nota.bairro || '';
    form.elements.cep.value = nota.cep || '';
    form.elements.municipio.value = nota.municipio || '';
    form.elements.uf.value = nota.uf || '';
    form.elements.fone.value = nota.fone || '';
    form.elements.baseCalculoIcms.value = nota.baseCalculoIcms || '';
    form.elements.valorIcms.value = nota.valorIcms || '';
    form.elements.baseCalculoIcmsSt.value = nota.baseCalculoIcmsSt || '';
    form.elements.valorIcmsSt.value = nota.valorIcmsSt || '';
    form.elements.valorFrete.value = nota.valorFrete || '';
    form.elements.valorSeguro.value = nota.valorSeguro || '';
    form.elements.desconto.value = nota.desconto || '';
    form.elements.valorIpi.value = nota.valorIpi || '';
    form.elements.valorTotalProdutos.value = nota.valorTotalProdutos || '';
    form.elements.valorTotalNota.value = nota.valorTotalNota || '';

    tabelaItens.innerHTML = '';
    if(nota.itens && nota.itens.length > 0) {
        nota.itens.forEach(item => criarLinhaItem(item));
    } else {
        if(modoFormulario !== 'VISUALIZAR') criarLinhaItem();
    }
}

function montarNotaFiscal() {
    const campos = form.elements;
    return {
        numero: campos.numero.value,
        serie: campos.serie.value,
        naturezaOperacao: campos.naturezaOperacao.value,
        dataHoraEmissao: campos.dataHoraEmissao.value,
        razaoSocial: campos.razaoSocial.value,
        cnpjCpf: campos.cnpjCpf.value,
        inscricaoEstadual: campos.inscricaoEstadual.value,
        inscricaoEstadualSt: campos.inscricaoEstadualSt.value,
        endereco: campos.endereco.value,
        bairro: campos.bairro.value,
        cep: campos.cep.value,
        municipio: campos.municipio.value,
        uf: campos.uf.value,
        fone: campos.fone.value,
        baseCalculoIcms: numero(campos.baseCalculoIcms.value),
        valorIcms: numero(campos.valorIcms.value),
        baseCalculoIcmsSt: numero(campos.baseCalculoIcmsSt.value),
        valorIcmsSt: numero(campos.valorIcmsSt.value),
        valorFrete: numero(campos.valorFrete.value),
        valorSeguro: numero(campos.valorSeguro.value),
        desconto: numero(campos.desconto.value),
        valorIpi: numero(campos.valorIpi.value),
        valorTotalProdutos: numero(campos.valorTotalProdutos.value),
        valorTotalNota: numero(campos.valorTotalNota.value),
        itens: obterItens()
    };
}

function obterItens() {
    return [...document.querySelectorAll(".input-item-row")]
        .map(row => ({
            codigo: row.querySelector('[data-field="codigo"]').value,
            descricao: row.querySelector('[data-field="descricao"]').value,
            ncm: row.querySelector('[data-field="ncm"]').value,
            cst: row.querySelector('[data-field="cst"]').value,
            cfop: row.querySelector('[data-field="cfop"]').value,
            unidade: row.querySelector('[data-field="unidade"]').value,
            quantidade: numero(row.querySelector('[data-field="quantidade"]').value),
            valorUnitario: numero(row.querySelector('[data-field="valorUnitario"]').value),
            valorTotal: numero(row.querySelector('[data-field="valorTotal"]').value)
        }))
        .filter(item => item.descricao !== "");
}

// Cálculos dinâmicos
function calcularTotalItem(input) {
    const row = input.closest('tr');
    const qtd = parseFloat(row.querySelector('[data-field="quantidade"]').value) || 0;
    const valUnit = parseFloat(row.querySelector('[data-field="valorUnitario"]').value) || 0;
    const totalInput = row.querySelector('[data-field="valorTotal"]');

    totalInput.value = (qtd * valUnit).toFixed(2);
    atualizarTotaisNota();
}

function atualizarTotaisNota() {
    let totalProdutos = 0;
    document.querySelectorAll('[data-field="valorTotal"]').forEach(input => {
        totalProdutos += parseFloat(input.value) || 0;
    });

    form.querySelector('[name="valorTotalProdutos"]').value = totalProdutos.toFixed(2);

    const frete = parseFloat(form.querySelector('[name="valorFrete"]').value) || 0;
    const seguro = parseFloat(form.querySelector('[name="valorSeguro"]').value) || 0;
    const desconto = parseFloat(form.querySelector('[name="desconto"]').value) || 0;
    const ipi = parseFloat(form.querySelector('[name="valorIpi"]').value) || 0;

    const totalNota = (totalProdutos + frete + seguro + ipi) - desconto;
    form.querySelector('[name="valorTotalNota"]').value = totalNota.toFixed(2);
}

// Integração com a API - Listagem (GET)
async function carregarNotas() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Erro ao carregar notas.");
        const notas = await response.json();
        preencherTabelaListagem(notas);
    } catch (e) {
        console.error(e);
    }
}

function preencherTabelaListagem(notas) {
    const tbody = document.querySelector("#tabelaNotas tbody");
    tbody.innerHTML = ``;

    if (notas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">Nenhuma nota fiscal encontrada.</td></tr>`;
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
                    <button onclick="buscarETratarNota(${nota.id}, 'VISUALIZAR')" class="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-blue-200">
                        Ver
                    </button>
                    <button onclick="buscarETratarNota(${nota.id}, 'EDITAR')" class="bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-amber-200">
                        Editar
                    </button>
                    <button onclick="excluirNota(${nota.id})" class="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-red-200">
                        Excluir
                    </button>
                </td>
            </tr>
        `);
    });
}

// Busca os dados do backend para alimentar a visualização ou edição
async function buscarETratarNota(id, acao) {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar dados estruturais da nota.");
        const nota = await response.json();

        exibirTelaFormulario(acao);
        preencherFormulario(nota);
    } catch (error) {
        alert(error.message);
    }
}

// API - Remoção (DELETE)
async function excluirNota(id) {
    if (!confirm("Deseja realmente excluir esta nota fiscal permanentemente?")) return;
    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (response.ok) {
            await carregarNotas();
        } else {
            alert("Não foi possível excluir a nota.");
        }
    } catch (error) {
        console.error("Erro ao deletar:", error);
    }
}

// Envio do formulário (POST / PUT)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const notaFiscal = montarNotaFiscal();
    const id = document.getElementById('notaId').value;

    if (!notaFiscal.numero || !notaFiscal.razaoSocial || notaFiscal.itens.length === 0) {
        alert("Campos obrigatórios ausentes: Verifique o Número, a Razão Social e adicione ao menos 1 Item.");
        return;
    }

    const urlFinal = modoFormulario === 'EDITAR' ? `${API_URL}/${id}` : API_URL;
    const metodoHttp = modoFormulario === 'EDITAR' ? 'PUT' : 'POST';

    try {
        const response = await fetch(urlFinal, {
            method: metodoHttp,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notaFiscal)
        });

        if (response.ok) {
            alert(`Nota Fiscal gravada com sucesso!`);
            exibirTelaListagem();
        } else {
            const erro = await response.text();
            alert(erro);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro de conexão com o backend.');
    }
});

// Eventos de Inicialização e Mapeamento de botões de navegação
btnNovaNota.addEventListener('click', () => {
    form.reset();
    document.getElementById('notaId').value = '';
    tabelaItens.innerHTML = '';
    tabelaItens.innerHTML = ''; // Limpa as linhas físicas de produtos da tela anterior
    exibirTelaFormulario('CRIAR');
    criarLinhaItem();
    criarLinhaItem(); // Abre uma única linha em branco para a nova nota

    exibirTelaFormulario('CRIAR');
    criarLinhaItem();


    btnVoltar.addEventListener('click', exibirTelaListagem);
    btnAdicionarItem.addEventListener('click', () => criarLinhaItem());
    if (btnAtualizarLista) btnAtualizarLista.addEventListener('click', carregarNotas);

    ['valorFrete', 'valorSeguro', 'desconto', 'valorIpi'].forEach(name => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) input.addEventListener('input', atualizarTotaisNota);
    });

// Inicialização default da SPA
    window.addEventListener('DOMContentLoaded', () => {
        exibirTelaListagem();
    });
});
