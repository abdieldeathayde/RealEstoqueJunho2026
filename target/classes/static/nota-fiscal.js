const tabelaItens = document.getElementById('tabelaItens').getElementsByTagName('tbody')[0];
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const form = document.getElementById('formNotaFiscal');

function numero(valor) {
    return valor === "" ? null : Number(valor);
}

// Adiciona uma linha de item dinâmica ao carregar e ao clicar no botão
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

window.onload = () => {
    criarLinhaItem();
    carregarNotas();
}; // Inicia com 1 item padrão

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

    // Cálculo simplificado do Total da Nota
    const frete = parseFloat(form.querySelector('[name="valorFrete"]').value) || 0;
    const seguro = parseFloat(form.querySelector('[name="valorSeguro"]').value) || 0;
    const desconto = parseFloat(form.querySelector('[name="desconto"]').value) || 0;
    const ipi = parseFloat(form.querySelector('[name="valorIpi"]').value) || 0;

    const totalNota = (totalProdutos + frete + seguro + ipi) - desconto;
    form.querySelector('[name="valorTotalNota"]').value = totalNota.toFixed(2);
}

carregarNotas();

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
async function carregarNotas(){

    try{

        const response = await fetch("http://localhost:8080/api/notas-fiscais");

        if(!response.ok){
            throw new Error("Erro ao carregar notas.");
        }

        const notas = await response.json();

        preencherTabela(notas);

    }catch(e){

        console.error(e);

    }

}

function preencherTabela(notas){

        const tbody = document.querySelector("#tabelaNotas tbody");

        if(!tbody){
            console.error("Tabela #tabelaNotas não encontrada.");
            return;
        }

        tbody.innerHTML = ``;




    notas.forEach(nota => {

        tbody.insertAdjacentHTML("beforeend", `

        <tr class="border-b">

            <td>${nota.id}</td>

            <td>${nota.numero}</td>

            <td>${nota.serie}</td>

            <td>${nota.razaoSocial}</td>

            <td>R$ ${(nota.valorTotalNota ?? 0).toFixed(2)}</td>

            <td>

                <button
                    onclick="visualizar(${nota.id})"
                    class="bg-blue-600 text-white px-2 py-1 rounded">
                    Ver
                </button>

                <button
                    onclick="excluir(${nota.id})"
                    class="bg-red-600 text-white px-2 py-1 rounded">
                    Excluir
                </button>

            </td>

        </tr>

        `);

    });

}

// Eventos adicionais para recalcular quando mudarem os inputs adicionais
['valorFrete', 'valorSeguro', 'desconto', 'valorIpi'].forEach(name => {
    form.querySelector(`[name="${name}"]`).addEventListener('input', atualizarTotaisNota);
});




async function visualizar(id) {

    const response = await fetch(
        `http://localhost:8080/api/notas-fiscais/${id}`
    );

    if (!response.ok) {
        alert("Erro ao carregar a nota.");
        return;
    }

    const nota = await response.json();

    alert(`
Número: ${nota.numero}
Cliente: ${nota.razaoSocial}
Valor: R$ ${(nota.valorTotalNota ?? 0).toFixed(2)}
Itens: ${nota.itens.length}
`);
}

async function excluir(id) {

    if (!confirm("Deseja excluir esta nota?"))
        return;

    const response = await fetch(
        `http://localhost:8080/api/notas-fiscais/${id}`,
        {
            method: "DELETE"
        }
    );

    if (response.ok) {
        await carregarNotas();
    } else {
        alert("Erro ao excluir.");
    }



}

// Envio do formulário via API para o Backend Spring
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const notaFiscal = montarNotaFiscal();

    if (!notaFiscal.razaoSocial) {
        alert("Informe a razão social.");
        return;
    }

    if (notaFiscal.itens.length === 0) {
        alert("Adicione pelo menos um item.");
        return;
    }

    if (!notaFiscal.numero) {
        alert("Informe o número da nota.");
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/notas-fiscais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notaFiscal)
        });

        if (response.ok) {
            alert('Nota Fiscal gravada com sucesso no MySQL!');
            const notaSalva = await response.json();
            alert(`Nota ${notaSalva.numero} salva com sucesso!`);
            carregarNotas();
            console.log(notaSalva);
            form.reset();
            tabelaItens.innerHTML = '';
            criarLinhaItem();
            atualizarTotaisNota();
        } else {

            const erro = await response.text();
            console.error(erro);
            alert(erro);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro de conexão com o backend.');
    }
});