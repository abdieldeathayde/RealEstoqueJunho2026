const tabelaItens = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const btnAtualizarLista = document.getElementById('btnAtualizarLista');
const form = document.getElementById('formNotaFiscal');

function numero(valor) {
    return valor === "" ? null : Number(valor);
}

// Adiciona uma linha de item dinâmica na tabela do formulário
function criarLinhaItem() {
    const row = tabelaItens.insertRow();
    row.className = "hover:bg-slate-50 transition-colors input-item-row";
    row.innerHTML = `
        <td class="p-2"><input type="text" class="w-16 border rounded p-1" data-field="codigo"></td>
        <td class="p-2"><input type="text" class="w-full border rounded p-1" data-field="descricao"></td>
        <td class="p-2"><input type="text" class="w-16 border rounded p-1" data-field="ncm"></td>
        <td class="p-2"><input type="text" class="w-12 border rounded p-1" data-field="cst"></td>
        <td class="p-2"><input type="text" class="w-12 border rounded p-1" data-field="cfop"></td>
        <td class="p-2"><input type="text" class="w-10 border rounded p-1" data-field="unidade"></td>
        <td class="p-2"><input type="number" class="w-14 border rounded p-1" data-field="quantidade" oninput="calcularTotalItem(this)"></td>
        <td class="p-2"><input type="number" step="0.01" class="w-20 border rounded p-1" data-field="valorUnitario" oninput="calcularTotalItem(this)"></td>
        <td class="p-2"><input type="number" step="0.01" class="w-20 border bg-slate-50 rounded p-1 font-medium" data-field="valorTotal" readonly></td>
        <td class="p-2 text-center"><button type="button" onclick="this.closest('tr').remove(); atualizarTotaisNota();" class="text-red-500 hover:text-red-700 font-semibold">✕</button></td>
    `;
}

// Inicialização da página e atribuição de eventos
btnAdicionarItem.addEventListener('click', criarLinhaItem);

if (btnAtualizarLista) {
    btnAtualizarLista.addEventListener('click', carregarNotas);
}

window.addEventListener('DOMContentLoaded', () => {
    criarLinhaItem();
    carregarNotas(); // Garante o carregamento inicial usando a função correta
});

// Listener para recalcular quando mudarem os inputs adicionais do faturamento
['valorFrete', 'valorSeguro', 'desconto', 'valorIpi'].forEach(name => {
    const input = form.querySelector(`[name="${name}"]`);
    if (input) input.addEventListener('input', atualizarTotaisNota);
});

// Cálculos dinâmicos do formulário
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

// Mapeamento de dados do formulário para envio
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

// Integração com a API - Listagem (GET)
async function carregarNotas() {
    try {
        const response = await fetch("http://localhost:8080/api/notas-fiscais");
        if (!response.ok) throw new Error("Erro ao carregar notas.");

        const notas = await response.json();
        preencherTabela(notas);
    } catch (e) {
        console.error(e);
    }
}

function preencherTabela(notas) {
    const tbody = document.querySelector("#tabelaNotas tbody");
    if (!tbody) {
        console.error("Tabela #tabelaNotas não encontrada no HTML.");
        return;
    }

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
                    <button onclick="visualizar(${nota.id})" class="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-blue-200">
                        Ver
                    </button>
                    <button onclick="excluir(${nota.id})" class="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors border border-red-200">
                        Excluir
                    </button>
                </td>
            </tr>
        `);
    });
}

// Integração com a API - Detalhes (GET por ID)
async function visualizar(id) {
    try {
        const response = await fetch(`http://localhost:8080/api/notas-fiscais/${id}`);
        if (!response.ok) throw new Error("Erro ao carregar os detalhes da nota.");

        const nota = await response.json();
        alert(`
📌 Dados da Nota Fiscal:
-------------------------
ID Interno: ${nota.id}
Número: ${nota.numero}
Série: ${nota.serie}
Cliente/Razão Social: ${nota.razaoSocial}
Total da Nota: R$ ${(nota.valorTotalNota ?? 0).toFixed(2)}
Quantidade de Itens: ${nota.itens ? nota.itens.length : 0}
        `);
    } catch (error) {
        alert(error.message);
    }
}

// Integração com a API - Remoção (DELETE)
async function excluir(id) {
    if (!confirm("Deseja realmente excluir esta nota fiscal permanentemente?")) return;

    try {
        const response = await fetch(`http://localhost:8080/api/notas-fiscais/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            await carregarNotas(); // Recarrega o grid imediatamente
        } else {
            alert("Não foi possível excluir a nota.");
        }
    } catch (error) {
        console.error("Erro ao deletar:", error);
    }
}

// Envio do formulário (POST)
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const notaFiscal = montarNotaFiscal();

    if (!notaFiscal.numero || !notaFiscal.razaoSocial || notaFiscal.itens.length === 0) {
        alert("Campos obrigatórios ausentes: Verifique o Número, a Razão Social e adicione ao menos 1 Item.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/notas-fiscais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notaFiscal)
        });

        if (response.ok) {
            alert(`Nota Fiscal Nº ${notaFiscal.numero} gravada com sucesso!`);
            form.reset();
            tabelaItens.innerHTML = '';
            criarLinhaItem();
            atualizarTotaisNota();

            await carregarNotas(); // Atualiza a listagem de registros na tela
        } else {
            const erro = await response.text();
            alert(erro);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro de conexão com o backend.');
    }
});